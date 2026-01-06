import type { IService } from '@oslo-flanders/core';
import {
  QuadStore,
  ns,
  Logger,
  ServiceIdentifier,
  getApplicationProfileLabel,
  toPascalCase,
  toCamelCase,
  findAllAttributes,
  DataTypes,
} from '@oslo-flanders/core';
import { writeFileSync } from 'fs';
import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import { DataFactory } from 'rdf-data-factory';
import { RmlGenerationServiceConfiguration } from './config/RmlGenerationServiceConfiguration';
import { RmlPredicateObjectMap } from './types/Rml';
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
    this.outputHandlerService = outputHandlerService;
  }

  public async init(): Promise<void> {
    return this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    const mappings = this.generateMappings();

    this.writeMappings(mappings);
  }

  private generateMappings(): any {
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

      /* Class matches a SubjectMap in RML*/
      mappings[label] = {
        subjectMap: {
          template: `https://data.vlaanderen.be/id/${label}/{id}`,
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
        };

        /* Add language tag for RDF LangStrings */
        if (attributeDatatypeId === ns.rdf('langString').value)
          pom['language'] = this.configuration.language;

        /* Add datatype for primitive datatypes and SKOS Concepts. Otherwise, add joins for classes */
        if (Array.from(DataTypes.values()).includes(attributeDatatypeId)) {
          pom['datatype'] = attributeDatatypeId;
          pom['object'] = attributeLabel;
        } else if (attributeDatatypeId === ns.skos('Concept').value) {
          pom['datatype'] = ns.xsd('anyURI').value;
          pom['object'] = attributeLabel;
        } else {
          pom['join'] =
            `https://data.vlaanderen.be/id/${attributeDatatypeLabel}/{id}`;
          pom['object'] = attributeLabel;
        }

        mappings[label].predicateObjectMaps.push(pom);
      }
    }

    return mappings;
  }

  private writeMappings(mappings: any) {
    for (const label in mappings) {
      const triplesMapId: RDF.BlankNode = this.df.blankNode(
        `TriplesMap${label}`,
      );
      const subjectMapId: RDF.BlankNode = this.df.blankNode(
        `SubjectMap${label}`,
      );
      const predicateObjectMapIds: RDF.BlankNode[] = [];
      const subjectMapData = mappings[label]['subjectMap'];

      /* Subject Map */
      this.rmlStore.addQuads([
        this.df.quad(subjectMapId, ns.rdf('type'), ns.rml('SubjectMap')),
        this.df.quad(
          subjectMapId,
          ns.rml('template'),
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
          const predicateObjectMapId = this.df.blankNode(
            `PredicateObjectMap${label}.${pom.object}`,
          );
          const predicateMapId = this.df.blankNode(
            `PredicateMap${label}.${pom.object}`,
          );
          const objectMapId = this.df.blankNode(
            `ObjectMap${label}.${pom.object}`,
          );
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
              ns.rml('predicate'),
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
                ns.rml('template'),
                this.df.literal(pom.join),
              ),
              this.df.quad(objectMapId, ns.rml('termType'), ns.rml('IRI')),
            ]);
          } else if (pom.datatype == ns.xsd('anyURI').value) {
            /* Literals with anyURI datatype expect IRIs as term type */
            this.rmlStore.addQuads([
              this.df.quad(
                objectMapId,
                ns.rml('reference'),
                this.df.literal(pom.object),
              ),
              this.df.quad(objectMapId, ns.rml('termType'), ns.rml('IRI')),
            ]);
          } else if (pom.language) {
            /* String literal with language tag */
            this.rmlStore.addQuads([
              this.df.quad(
                objectMapId,
                ns.rml('reference'),
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
                ns.rml('reference'),
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
        this.df.quad(triplesMapId, ns.rdfs('label'), this.df.literal(`TriplesMap${label}`)),
        this.df.quad(triplesMapId, ns.rml('subjectMap'), subjectMapId),
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
