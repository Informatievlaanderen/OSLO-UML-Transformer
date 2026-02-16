import type { IService } from '@oslo-flanders/core';
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
import { readFileSync } from 'fs';
import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import { DataFactory } from 'rdf-data-factory';
import { RmlGenerationServiceConfiguration } from './config/RmlGenerationServiceConfiguration';
import type {
  RmlPredicateObjectMap,
  RmlMappingConfig,
  RmlTriplesMap,
  RmlSubjectMap,
  RmlTripleMapEntry,
} from './types/Rml';
import { RmlGenerationServiceIdentifier } from './config/RmlGenerationServiceIdentifier';
import { OutputHandlerService } from './OutputHandlerService';
import { replaceVariables } from './utils/replaceVariables';
import { resolveDataSource } from './utils/resolveDataSource';
import { duplicateReusedMappings } from './utils/duplicateReusedMappings';
import { writeObjectMapQuads } from './utils/writeObjectMapQuads';

@injectable()
export class RmlGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: RmlGenerationServiceConfiguration;
  private readonly df: DataFactory;
  private readonly store: QuadStore;
  private readonly rmlStore: QuadStore;
  private readonly outputHandlerService: OutputHandlerService;
  private mapping: RmlMappingConfig | undefined;

  public constructor(
    @inject(RmlGenerationServiceIdentifier.Logger) logger: Logger,
    @inject(RmlGenerationServiceIdentifier.Configuration)
    config: RmlGenerationServiceConfiguration,
    @inject(RmlGenerationServiceIdentifier.QuadStore) store: QuadStore,
    @inject(RmlGenerationServiceIdentifier.OutputHandlerService)
    outputHandlerService: OutputHandlerService,
  ) {
    this.logger = logger;
    this.configuration = config;
    this.store = store;
    this.rmlStore = new QuadStore();
    this.df = new DataFactory();
    this.mapping = { variables: [], datasources: {} };
    this.outputHandlerService = outputHandlerService;
  }

  public async init(): Promise<void> {
    this.mapping = JSON.parse(
      readFileSync(this.configuration.mapping).toString(),
    );
    return this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    const mappings = await this.generateMappings();
    replaceVariables(mappings, this.mapping);
    this.writeMappings(mappings);
  }

  private async generateMappings(): Promise<Record<string, RmlTriplesMap>> {
    const mappings: Record<string, RmlTriplesMap> = {};
    const parentTriplesMaps: Record<string, RmlTripleMapEntry[]> = {};

    for (const quad of this.getClassAndDatatypeQuads()) {
      await this.processClassQuad(quad, mappings, parentTriplesMaps);
    }

    duplicateReusedMappings(mappings, parentTriplesMaps, this.logger);
    return mappings;
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
      this.configuration.language,
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
    const triplesMapKey = `${this.configuration.baseIRI}TM.${label}`;

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
      this.configuration.language,
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

    const rangeInfo = this.resolveRange(attributeId);
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
      pom.language = this.configuration.language;
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
      this.configuration.language,
    )?.value;

    if (!datatypeId || !rawLabel) {
      this.logger.error(`Unknown datatype for attribute ${attributeId.value}`);
      return null;
    }

    return { datatypeId, datatypeLabel: toPascalCase(rawLabel) };
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
    const parentTriplesMap = `${this.configuration.baseIRI}TM.${prefix}${rangeInfo.datatypeLabel}`;
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

  private writeMappings(mappings: Record<string, RmlTriplesMap>): void {
    for (const triplesMap in mappings) {
      this.writeSingleTriplesMap(triplesMap, mappings[triplesMap]);
    }
    this.outputHandlerService.write(this.rmlStore);
  }

  private writeSingleTriplesMap(
    triplesMapUri: string,
    data: RmlTriplesMap,
  ): void {
    const triplesMapId = this.df.namedNode(triplesMapUri);
    const label: string = data.label;
    const subjectMapId = this.df.blankNode(`SM.${label}`);
    const logicalSourceId = this.df.blankNode(`LS.${label}`);

    this.writeLogicalSource(logicalSourceId, label);
    this.writeSubjectMap(subjectMapId, data.subjectMap);
    const pomIds = this.writePredicateObjectMaps(
      data.predicateObjectMaps,
      label,
    );

    this.rmlStore.addQuads([
      this.df.quad(triplesMapId, ns.rdf('type'), ns.rml('TriplesMap')),
      this.df.quad(
        triplesMapId,
        ns.rdfs('label'),
        this.df.literal(`TriplesMap${label}`),
      ),
      this.df.quad(triplesMapId, ns.rml('subjectMap'), subjectMapId),
      this.df.quad(triplesMapId, ns.rml('logicalSource'), logicalSourceId),
    ]);

    for (const pomId of pomIds) {
      this.rmlStore.addQuad(
        this.df.quad(triplesMapId, ns.rml('predicateObjectMap'), pomId),
      );
    }
  }

  private writeLogicalSource(
    logicalSourceId: RDF.BlankNode,
    label: string,
  ): void {
    const sourceId = this.df.blankNode(`S.${label}`);
    const { source, referenceFormulation, iterator } = resolveDataSource(
      label,
      this.mapping,
      this.logger,
    );

    this.rmlStore.addQuads([
      this.df.quad(logicalSourceId, ns.rdf('type'), ns.rml('LogicalSource')),
      this.df.quad(logicalSourceId, ns.rml('source'), sourceId),
      this.df.quad(
        logicalSourceId,
        ns.rml('referenceFormulation'),
        this.df.namedNode(referenceFormulation),
      ),
      this.df.quad(sourceId, ns.rdf('type'), ns.rml('Source')),
      this.df.quad(sourceId, ns.rdf('type'), ns.rml('FilePath')),
      this.df.quad(sourceId, ns.rml('path'), this.df.literal(source)),
      this.df.quad(sourceId, ns.rml('root'), ns.rml('CurrentWorkingDirectory')),
    ]);

    if (iterator) {
      this.rmlStore.addQuad(
        this.df.quad(
          logicalSourceId,
          ns.rml('iterator'),
          this.df.literal(iterator),
        ),
      );
    }
  }

  private writeSubjectMap(
    subjectMapId: RDF.BlankNode,
    subjectMapData: RmlSubjectMap,
  ): void {
    this.rmlStore.addQuads([
      this.df.quad(subjectMapId, ns.rdf('type'), ns.rml('SubjectMap')),
      this.df.quad(
        subjectMapId,
        ns.rml(subjectMapData.referenceType ?? 'template'),
        this.df.literal(subjectMapData.template),
      ),
      this.df.quad(
        subjectMapId,
        ns.rml('class'),
        this.df.namedNode(subjectMapData.class),
      ),
      this.df.quad(
        subjectMapId,
        ns.rml('termType'),
        ns.rml(subjectMapData.termType ?? 'IRI'),
      ),
    ]);
  }

  private writePredicateObjectMaps(
    poms: RmlPredicateObjectMap[],
    label: string,
  ): RDF.BlankNode[] {
    return poms.map((pom) => {
      const pomId = this.df.blankNode();
      const predicateMapId = this.df.blankNode();
      const objectMapId = this.df.blankNode();

      this.rmlStore.addQuads([
        this.df.quad(pomId, ns.rdf('type'), ns.rml('PredicateObjectMap')),
        this.df.quad(pomId, ns.rml('predicateMap'), predicateMapId),
        this.df.quad(pomId, ns.rml('objectMap'), objectMapId),
        this.df.quad(predicateMapId, ns.rdf('type'), ns.rml('PredicateMap')),
        this.df.quad(
          predicateMapId,
          ns.rml('constant'),
          this.df.namedNode(pom.predicate),
        ),
      ]);

      writeObjectMapQuads(
        objectMapId,
        pom,
        label,
        this.rmlStore,
        this.df,
        this.logger,
      );

      return pomId;
    });
  }
}
