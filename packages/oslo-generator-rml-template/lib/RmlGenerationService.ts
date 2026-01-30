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
import { RmlPredicateObjectMap, RmlMappingConfig } from './types/Rml';
import { RmlGenerationServiceIdentifier } from './config/RmlGenerationServiceIdentifier';
import { OutputHandlerService } from './OutputHandlerService';

@injectable()
export class RmlGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: RmlGenerationServiceConfiguration;
  public readonly df: DataFactory;
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
    this.mapping = {
      variables: [],
      datasources: {},
    };
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
    this.replaceVariables(mappings);
    this.writeMappings(mappings);
  }

  private async replaceVariables(mappings: any): Promise<any> {
    if (!this.mapping) return;

    for (const variable of this.mapping.variables) {
      for (const label in mappings) {
        const triplesMap = mappings[label];

        /* Subject Map */
        if (triplesMap.subjectMap.template === variable['key']) {
          triplesMap.subjectMap.template = variable['value'];
          if ('referenceType' in variable) {
            triplesMap.subkectMap.referenceType = variable['referenceType'];
          }
        }

        /* Predicate Object Maps */
        for (const pom of triplesMap.predicateObjectMaps) {
          const object = pom.join ? pom.join : pom.object;
          if (object === variable['key']) {
            if (pom.join) pom.join = variable['value'];
            else pom.object = variable['value'];
            pom.referenceType = variable['referenceType'];
          }
        }
      }
    }

    return mappings;
  }

  private async generateMappings(): Promise<any> {
    const mappings: any = {};

    /* Create a RML mapping file for each class and datatype in the diagram */
    for (const quad of [
      ...this.store.findQuads(null, ns.rdf('type'), ns.owl('Class')),
      ...this.store.findQuads(null, ns.rdf('type'), ns.rdfs('Datatype')),
    ]) {
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
        continue;
      }

      /* Class labels should be always pascal cased */
      label = toPascalCase(label);

      if (!assignedUri) {
        this.logger.error(
          `Unknown assigned URI for subject ${classId.value}, cannot generate mapping`,
        );
        continue;
      }

      /* TriplesMaps must have a prefix if available to avoid duplicate labels, for example: foaf:Person and person:Person */
      const splittedUri = await splitUri(assignedUri);
      if (splittedUri?.prefix) {
        const prefix = splittedUri.prefix.toUpperCase();
        label = `${prefix}${label}`;
      }

      /* Class matches a SubjectMap in RML*/
      mappings[label] = {
        subjectMap: {
          template: `${label}`,
          class: assignedUri,
        },
        predicateObjectMaps: [],
      };

      /* Attributes matches a Predicate Object Map with each a Predicate Map and Object Map in RML*/
      let attributeIds: RDF.Term[] = [];
      attributeIds = findAllAttributes(classId, attributeIds, this.store);

      for (const attributeId of attributeIds) {
        let attributeLabel = getApplicationProfileLabel(
          attributeId,
          this.store,
          this.configuration.language,
        )?.value;

        const attributeAssignedUri =
          this.store.getAssignedUri(attributeId)?.value;

        if (!attributeLabel) {
          this.logger.error(`Unknown label for attribute ${attributeId.value}`);
          continue;
        }
        /* Attribute labels should be always camel cased */
        attributeLabel = toCamelCase(attributeLabel);

        if (!attributeAssignedUri) {
          this.logger.error(
            `Unknown assigned URI for attribute ${attributeId.value}`,
          );
          continue;
        }

        const attributeRangeId = this.store.getRange(attributeId);
        if (!attributeRangeId) {
          this.logger.error(`Unknown range for attribute ${attributeId.value}`);
          continue;
        }
        const attributeDatatypeId =
          this.store.getAssignedUri(attributeRangeId)?.value;
        let attributeDatatypeLabel = getApplicationProfileLabel(
          attributeRangeId,
          this.store,
          this.configuration.language,
        )?.value;

        if (!attributeDatatypeId || !attributeDatatypeLabel) {
          this.logger.error(
            `Unknown datatype for attribute ${attributeId.value}`,
          );
          continue;
        }
        attributeDatatypeLabel = toPascalCase(attributeDatatypeLabel);

        const pom: RmlPredicateObjectMap = {
          predicate: attributeAssignedUri,
          object: undefined,
          join: undefined,
          datatype: undefined,
          language: undefined,
          referenceType: undefined,
        };

        /* Add language tag for RDF LangStrings */
        if (attributeDatatypeId === ns.rdf('langString').value)
          pom['language'] = this.configuration.language;

        /* Add datatype for primitive datatypes and SKOS Concepts. Otherwise, add joins for classes */
        if (Array.from(DataTypes.values()).includes(attributeDatatypeId)) {
          pom['datatype'] = attributeDatatypeId;
          pom['object'] = `${label}.${attributeLabel}`;
        } else if (attributeDatatypeId === ns.skos('Concept').value) {
          pom['datatype'] = ns.xsd('anyURI').value;
          pom['object'] = `${label}.${attributeLabel}`;
        } else {
          pom['join'] = `${label}.${attributeLabel}`;
        }

        mappings[label].predicateObjectMaps.push(pom);
      }
    }

    return mappings;
  }

  private writeMappings(mappings: any) {
    for (const label in mappings) {
      const triplesMapId: RDF.BlankNode = this.df.blankNode(`_:TM.${label}`);
      const subjectMapId: RDF.BlankNode = this.df.blankNode(`_:SM.${label}`);
      const logicalSourceId: RDF.BlankNode = this.df.blankNode(`_:LS.${label}`);
      const sourceId: RDF.BlankNode = this.df.blankNode(`_:S.${label}`);
      const predicateObjectMapIds: RDF.BlankNode[] = [];
      const subjectMapData = mappings[label]['subjectMap'];

      /* Logical Source: CSV as example if not specified in mapping configuration */
      let source = `test.csv`;
      let referenceFormulation = ns.rml('CSV').value;
      let iterator: string | undefined = undefined;

      const datasourceKey = `${label}`;
      if (this.mapping && datasourceKey in this.mapping.datasources) {
        const datasourceSource =
          this.mapping?.datasources[datasourceKey].source;
        const datasourceReferenceFormulation =
          this.mapping?.datasources[datasourceKey].referenceFormulation;
        const datasourceIterator =
          this.mapping?.datasources[datasourceKey].iterator;

        if (this.mapping?.datasources[datasourceKey].source) {
          if (datasourceReferenceFormulation === 'csv') {
            source = datasourceSource;
            referenceFormulation = ns.rml('CSV').value;
            iterator = undefined;
          } else if (datasourceReferenceFormulation === 'json') {
            source = datasourceSource;
            referenceFormulation = ns.rml('JSONPath').value;
            iterator = datasourceIterator;
          } else if (datasourceReferenceFormulation === 'xml') {
            source = datasourceSource;
            referenceFormulation = ns.rml('XPath').value;
            iterator = datasourceIterator;
          } else {
            console.error(
              `Reference Formulation "${datasourceReferenceFormulation}" not implemented`,
            );
          }
        }
      }

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
        this.df.quad(
          sourceId,
          ns.rml('root'),
          ns.rml('CurrentWorkingDirectory'),
        ),
      ]);

      /* CSV or SQL do not need an iterator (defaults to row), other formats do */
      if (iterator)
        this.rmlStore.addQuad(
          this.df.quad(
            logicalSourceId,
            ns.rml('iterator'),
            this.df.literal(iterator),
          ),
        );

      /* Subject Map */
      const referenceType = subjectMapData.referenceType;
      this.rmlStore.addQuads([
        this.df.quad(subjectMapId, ns.rdf('type'), ns.rml('SubjectMap')),
        this.df.quad(
          subjectMapId,
          ns.rml(referenceType ? referenceType : 'template'),
          this.df.literal(subjectMapData.template),
        ),
        this.df.quad(
          subjectMapId,
          ns.rml('class'),
          this.df.namedNode(subjectMapData.class),
        ),
      ]);

      /* Predicate Object Maps */
      mappings[label]['predicateObjectMaps'].forEach(
        (pom: any, index: number) => {
          const object = pom.object ? pom.object : pom.join;
          const predicateObjectMapId = this.df.blankNode(`_:POM.${object}`);
          const predicateMapId = this.df.blankNode(`_:PM.${object}`);
          const objectMapId = this.df.blankNode(`_:OM.${object}`);
          predicateObjectMapIds.push(predicateObjectMapId);

          /* Predicate Object Map: link both Predicate and Object Maps */
          this.rmlStore.addQuads([
            this.df.quad(
              predicateObjectMapId,
              ns.rdf('type'),
              ns.rml('PredicateObjectMap'),
            ),
            this.df.quad(
              predicateObjectMapId,
              ns.rml('predicateMap'),
              predicateMapId,
            ),
            this.df.quad(
              predicateObjectMapId,
              ns.rml('objectMap'),
              objectMapId,
            ),
          ]);

          /* Predicate Map: specify the predicate URI to use */
          this.rmlStore.addQuads([
            this.df.quad(
              predicateMapId,
              ns.rdf('type'),
              ns.rml('PredicateMap'),
            ),
            this.df.quad(
              predicateMapId,
              ns.rml('constant'),
              this.df.namedNode(pom.predicate),
            ),
          ]);

          /* Object Map: specify which object such as literal, URI, or joining with other Triples Map */
          this.rmlStore.addQuad(
            this.df.quad(objectMapId, ns.rdf('type'), ns.rml('ObjectMap')),
          );

          if (pom.join) {
            /* Joining with other Triples Map or datasets: through URIs instead of join condition */
            this.rmlStore.addQuads([
              this.df.quad(
                objectMapId,
                ns.rml(pom.referenceType ? pom.referenceType : 'template'),
                this.df.literal(pom.join),
              ),
              this.df.quad(objectMapId, ns.rml('termType'), ns.rml('IRI')),
            ]);
          } else if (pom.datatype == ns.xsd('anyURI').value) {
            /* Literals with anyURI datatype expect IRIs as term type */
            this.rmlStore.addQuads([
              this.df.quad(
                objectMapId,
                ns.rml(pom.referenceType ? pom.referenceType : 'template'),
                this.df.literal(pom.object),
              ),
              this.df.quad(objectMapId, ns.rml('termType'), ns.rml('IRI')),
            ]);
          } else if (pom.language) {
            /* String literal with language tag */
            this.rmlStore.addQuads([
              this.df.quad(
                objectMapId,
                ns.rml(pom.referenceType ? pom.referenceType : 'reference'),
                this.df.literal(pom.object),
              ),
              this.df.quad(
                objectMapId,
                ns.rml('language'),
                this.df.literal(pom.language),
              ),
              this.df.quad(objectMapId, ns.rml('termType'), ns.rml('Literal')),
            ]);
          } else if (pom.datatype) {
            /* Primitive datatype */
            this.rmlStore.addQuads([
              this.df.quad(
                objectMapId,
                ns.rml(pom.referenceType ? pom.referenceType : 'reference'),
                this.df.literal(pom.object),
              ),
              this.df.quad(
                objectMapId,
                ns.rml('datatype'),
                this.df.namedNode(pom.datatype),
              ),
              this.df.quad(objectMapId, ns.rml('termType'), ns.rml('Literal')),
            ]);
          } else {
            console.error(`Cannot generate Object Map for ${label}`);
            return;
          }
        },
      );

      /* Triples Map */
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
      for (const predicateObjectMapId of predicateObjectMapIds) {
        this.rmlStore.addQuad(
          this.df.quad(
            triplesMapId,
            ns.rml('predicateObjectMap'),
            predicateObjectMapId,
          ),
        );
      }
    }

    /* Write mappings to disk */
    this.outputHandlerService.write(this.rmlStore);
  }
}
