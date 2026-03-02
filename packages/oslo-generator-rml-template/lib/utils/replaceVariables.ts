import type {
  RmlPredicateObjectMap,
  RmlMappingConfig,
  RmlSubjectMap,
  RmlTriplesMap,
  RmlMappingVariable,
} from '../types/Rml';

export function replaceVariables(
  mappings: Record<string, RmlTriplesMap>,
  mapping: RmlMappingConfig | undefined,
): void {
  if (!mapping) return;

  for (const variable of mapping.variables) {
    for (const label in mappings) {
      const triplesMap = mappings[label];
      replaceInSubjectMap(triplesMap.subjectMap, variable);
      for (const pom of triplesMap.predicateObjectMaps) {
        replaceInPom(pom, variable);
      }
    }
  }
}

function replaceInSubjectMap(
  subjectMap: RmlSubjectMap,
  variable: RmlMappingVariable,
): void {
  if (subjectMap.template !== variable.key) return;
  subjectMap.template = variable.value;
  if (variable.referenceType) subjectMap.referenceType = variable.referenceType;
  if (variable.termType) subjectMap.termType = variable.termType;
}

function replaceInPom(
  pom: RmlPredicateObjectMap,
  variable: RmlMappingVariable,
): void {
  if (pom.parentTriplesMap) {
    if (pom.child === variable.key) {
      pom.child = variable.value;
    } else if (pom.parent === variable.key) {
      pom.parent = variable.value;
    } else if (pom.object === variable.key) {
      pom.object = variable.value;
      pom.referenceType = variable.referenceType;
    }
  } else if (pom.object === variable.key) {
    pom.object = variable.value;
    pom.referenceType = variable.referenceType;
  }
}
