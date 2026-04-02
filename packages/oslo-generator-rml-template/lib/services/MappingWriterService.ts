import { QuadStore, ns, Logger } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import type {
  RmlMappingConfig,
  RmlPredicateObjectMap,
  RmlTriplesMap,
  RmlSubjectMap,
} from '../types/Rml';
import type { OutputHandlerService } from '../OutputHandlerService';
import { resolveDataSource } from '../utils/resolveDataSource';
import { writeObjectMapQuads } from '../utils/writeObjectMapQuads';

export class MappingWriterService {
  private readonly df: DataFactory;
  public readonly rmlStore: QuadStore;

  constructor(
    private readonly logger: Logger,
    private readonly outputHandlerService: OutputHandlerService,
    private readonly mapping: RmlMappingConfig | undefined,
  ) {
    this.df = new DataFactory();
    this.rmlStore = new QuadStore();
  }

  public writeMappings(mappings: Record<string, RmlTriplesMap>): void {
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
