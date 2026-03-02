import type { Logger } from '@oslo-flanders/core';
import type { RmlTriplesMap, RmlTripleMapEntry } from '../types/Rml';

export function duplicateReusedMappings(
  mappings: Record<string, RmlTriplesMap>,
  parentTriplesMaps: Record<string, RmlTripleMapEntry[]>,
  logger: Logger,
): void {
  for (const parentTriplesMap in parentTriplesMaps) {
    const entries = parentTriplesMaps[parentTriplesMap];
    if (entries.length <= 1) continue;

    if (!(parentTriplesMap in mappings)) {
      logger.error(
        `Parent Triples Map ${parentTriplesMap} is not specified in diagram`,
      );
      continue;
    }

    const mappingData = mappings[parentTriplesMap];

    for (const data of entries) {
      const { subKey, origin, property } = data;

      mappings[`${parentTriplesMap}(${subKey})`] = {
        label: `${mappingData.label}(${subKey})`,
        subjectMap: { ...mappingData.subjectMap },
        predicateObjectMaps: mappingData.predicateObjectMaps,
      };

      if (mappings[origin]) {
        for (const pom of mappings[origin].predicateObjectMaps) {
          if (
            pom.predicate === property &&
            pom.parentTriplesMap === parentTriplesMap
          ) {
            pom.parentTriplesMap = `${parentTriplesMap}(${subKey})`;
          }
        }
      }
    }

    delete mappings[parentTriplesMap];
  }
}
