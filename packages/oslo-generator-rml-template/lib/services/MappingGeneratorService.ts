import {
  QuadStore,
  ns,
  Logger,
  getApplicationProfileLabel,
  toPascalCase,
  toCamelCase,
  findAllAttributes,
  DataTypes,
  splitUri,
} from '@oslo-flanders/core';
import { duplicateReusedMappings } from '../utils/duplicateReusedMappings';
import type * as RDF from '@rdfjs/types';
import type {
  RmlPredicateObjectMap,
  RmlTriplesMap,
  RmlTripleMapEntry,
} from '../types/Rml';
import type { RangeInfo } from '../types/RangeInfo';

export class MappingGeneratorService {
  constructor(
    private readonly store: QuadStore,
    private readonly logger: Logger,
    private readonly language: string,
    private readonly baseIRI: string,
  ) {}

  public async generateMappings(): Promise<{
    mappings: Record<string, RmlTriplesMap>;
    parentTriplesMaps: Record<string, RmlTripleMapEntry[]>;
  }> {
    const mappings: Record<string, RmlTriplesMap> = {};
    const parentTriplesMaps: Record<string, RmlTripleMapEntry[]> = {};

    for (const quad of this.getClassAndDatatypeQuads()) {
      await this.processClassQuad(quad, mappings, parentTriplesMaps);
    }

    duplicateReusedMappings(mappings, parentTriplesMaps, this.logger); // Move here
    return { mappings, parentTriplesMaps };
  }

  private getClassAndDatatypeQuads(): RDF.Quad[] {
    return [
      ...this.store.findQuads(null, ns.rdf('type'), ns.owl('Class')),
      ...this.store.findQuads(null, ns.rdf('type'), ns.rdfs('Datatype')),
    ];
  }

  private async processClassQuad(
    quad: RDF.Quad,
    mappings: Record<string, RmlTriplesMap>,
    parentTriplesMaps: Record<string, RmlTripleMapEntry[]>,
  ): Promise<void> {
    const classId = quad.subject;
    let label = getApplicationProfileLabel(
      classId,
      this.store,
      this.language,
    )?.value;
    const assignedUri = this.store.getAssignedUri(classId)?.value;

    if (!label) {
      this.logger.error(
        `Unknown class label for subject ${classId.value}, cannot generate mapping`,
      );
      return;
    }
    label = toPascalCase(label);

    if (!assignedUri) {
      this.logger.error(
        `Unknown assigned URI for subject ${classId.value}, cannot generate mapping`,
      );
      return;
    }

    label = await this.applyPrefix(label, assignedUri);
    const triplesMapKey = `${this.baseIRI}TM.${label}`;

    mappings[triplesMapKey] = {
      label,
      subjectMap: { template: label, class: assignedUri, termType: 'IRI' },
      predicateObjectMaps: [],
    };

    await this.buildPredicateObjectMaps(
      classId,
      label,
      triplesMapKey,
      mappings,
      parentTriplesMaps,
    );
  }

  private async applyPrefix(
    label: string,
    assignedUri: string,
  ): Promise<string> {
    const splitted = await splitUri(assignedUri);
    if (splitted?.prefix) {
      return `${splitted.prefix.toUpperCase()}${label}`;
    }
    return label;
  }

  private async buildPredicateObjectMaps(
    classId: RDF.Term,
    classLabel: string,
    triplesMapKey: string,
    mappings: Record<string, RmlTriplesMap>,
    parentTriplesMaps: Record<string, RmlTripleMapEntry[]>,
  ): Promise<void> {
    const attributeIds = findAllAttributes(classId, [], this.store);

    for (const attributeId of attributeIds) {
      const pom = await this.buildSinglePom(
        attributeId,
        classLabel,
        triplesMapKey,
        parentTriplesMaps,
      );
      if (pom) {
        mappings[triplesMapKey].predicateObjectMaps.push(pom);
      }
    }
  }

  private async buildSinglePom(
    attributeId: RDF.Term,
    classLabel: string,
    triplesMapKey: string,
    parentTriplesMaps: Record<string, RmlTripleMapEntry[]>,
  ): Promise<RmlPredicateObjectMap | null> {
    let attributeLabel = getApplicationProfileLabel(
      attributeId,
      this.store,
      this.language,
    )?.value;
    const attributeAssignedUri = this.store.getAssignedUri(attributeId)?.value;

    if (!attributeLabel) {
      this.logger.error(`Unknown label for attribute ${attributeId.value}`);
      return null;
    }
    attributeLabel = toCamelCase(attributeLabel);

    if (!attributeAssignedUri) {
      this.logger.error(
        `Unknown assigned URI for attribute ${attributeId.value}`,
      );
      return null;
    }

    const rangeInfo: RangeInfo | null = this.resolveRange(attributeId);
    if (!rangeInfo) return null;

    const pom: RmlPredicateObjectMap = {
      predicate: attributeAssignedUri,
      object: '',
      child: '',
      parent: '',
      parentTriplesMap: '',
      datatype: '',
      language: '',
      referenceType: '',
    };

    if (rangeInfo.datatypeId === ns.rdf('langString').value) {
      pom.language = this.language;
    }

    if (Array.from(DataTypes.values()).includes(rangeInfo.datatypeId)) {
      pom.datatype = rangeInfo.datatypeId;
      pom.object = `${classLabel}.${attributeLabel}`;
    } else if (rangeInfo.datatypeId === ns.skos('Concept').value) {
      pom.datatype = ns.xsd('anyURI').value;
      pom.object = `${classLabel}.${attributeLabel}`;
    } else {
      await this.buildJoinPom(
        pom,
        classLabel,
        attributeLabel,
        rangeInfo,
        attributeAssignedUri,
        triplesMapKey,
        parentTriplesMaps,
      );
    }

    return pom;
  }

  private async buildJoinPom(
    pom: RmlPredicateObjectMap,
    classLabel: string,
    attributeLabel: string,
    rangeInfo: { datatypeId: string; datatypeLabel: string },
    attributeAssignedUri: string,
    triplesMapKey: string,
    parentTriplesMaps: Record<string, RmlTripleMapEntry[]>,
  ): Promise<void> {
    pom.child = `JC${classLabel}.${attributeLabel}`;
    pom.parent = `JC${classLabel}.${rangeInfo.datatypeLabel}`;
    pom.object = `${classLabel}.${attributeLabel}`;

    const splitted = await splitUri(rangeInfo.datatypeId);
    const prefix = splitted?.prefix ? splitted.prefix.toUpperCase() : '';
    const parentTriplesMap = `${this.baseIRI}TM.${prefix}${rangeInfo.datatypeLabel}`;
    pom.parentTriplesMap = parentTriplesMap;

    if (!parentTriplesMaps[parentTriplesMap]) {
      parentTriplesMaps[parentTriplesMap] = [];
    }

    parentTriplesMaps[parentTriplesMap].push({
      subKey: `${classLabel}.${attributeLabel}`,
      origin: triplesMapKey,
      property: attributeAssignedUri,
    });
  }

  private resolveRange(
    attributeId: RDF.Term,
  ): { datatypeId: string; datatypeLabel: string } | null {
    const rangeId = this.store.getRange(attributeId);
    if (!rangeId) {
      this.logger.error(`Unknown range for attribute ${attributeId.value}`);
      return null;
    }

    const datatypeId = this.store.getAssignedUri(rangeId)?.value;
    const rawLabel = getApplicationProfileLabel(
      rangeId,
      this.store,
      this.language,
    )?.value;

    if (!datatypeId || !rawLabel) {
      this.logger.error(`Unknown datatype for attribute ${attributeId.value}`);
      return null;
    }

    return { datatypeId, datatypeLabel: toPascalCase(rawLabel) };
  }
}
