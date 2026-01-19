/* eslint-disable eslint-comments/disable-enable-pair */

import * as path from 'path';
import type { IService } from '@oslo-flanders/core';
import {
  QuadStore,
  ns,
  Logger,
  ServiceIdentifier,
  getApplicationProfileLabel,
  getMinCount,
  ensureOutputDirectory,
  toPascalCase,
  toCamelCase,
  findAllAttributes,
  splitUri,
} from '@oslo-flanders/core';
import { writeFileSync } from 'fs';
import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import { DataFactory } from 'rdf-data-factory';
import { SparqlGenerationServiceConfiguration } from './config/SparqlGenerationServiceConfiguration';

@injectable()
export class SparqlGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: SparqlGenerationServiceConfiguration;
  public readonly dataFactory = new DataFactory();
  public readonly store: QuadStore;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration)
    config: SparqlGenerationServiceConfiguration,
    @inject(ServiceIdentifier.QuadStore) store: QuadStore,
  ) {
    this.logger = logger;
    this.configuration = config;
    this.store = store;
  }

  public async init(): Promise<void> {
    return this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    /* Create SPARQL SELECT queries as JSON */
    const queries = await this.createSelectQueries();

    /* Write queries to file */
    await this.writeQueries(queries);
  }

  private async createSelectQueries(): Promise<Object> {
    const queries: any = {};

    /* Create a query for each class and datatype in the diagram */
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
          `Unknown class label for subject ${classId.value}, cannot generate query`,
        );
        continue;
      }
      /* Class labels should be always pascal cased */
      label = toPascalCase(label);

      if (!assignedUri) {
        this.logger.error(
          `Unknown assigned URI for subject ${classId.value}, cannot generate query`,
        );
        continue;
      }

      /* If a prefix is available use it as label to avoid conflicts such as foaf:Person and person:Person */
      const splitted = await splitUri(assignedUri);
      if (splitted)
        label = `${splitted.prefix.toUpperCase()}${label}`;

      queries[label] = {
        type: 'query',
        queryType: 'SELECT',
        prefixes: {
          rdf: ns.rdf('').value,
        },
        variables: [{ termType: 'Variable', value: 's' }],
        where: [
          {
            type: 'bgp',
            triples: [
              /* Filter on class RDF type */
              {
                subject: { termType: 'Variable', value: 's' },
                predicate: {
                  termType: 'NamedNode',
                  value: ns.rdf('type').value,
                },
                object: { termType: 'NamedNode', value: assignedUri },
              },
            ],
          },
        ],
      };

      /* Try to extract prefixes and define them as SPARQL PREFIXes in the query */
      if (splitted) queries[label].prefixes[splitted.prefix] = splitted.uri;
      else this.logger.warn('Splitting URI failed for extracting prefix');

      /* Add all attributes of the class to the query */
      let attributeIds: RDF.Term[] = [];
      attributeIds = findAllAttributes(classId, attributeIds, this.store);

      /* Find all attributes for object */
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

        /* Min count == 0 is reflected as SPARQL OPTIONAL in queries */
        const attributeMinCount = getMinCount(attributeId, this.store);

        /* Each attribute is a SPARQL variable which will show up in the query results */
        queries[label].variables.push({
          termType: 'Variable',
          value: attributeLabel,
        });

        /* Try to extract prefixes and define them as SPARQL PREFIXes in the query */
        const splitted = await splitUri(attributeAssignedUri);
        if (splitted) queries[label].prefixes[splitted.prefix] = splitted.uri;

        /* Put each attribute in the WHERE clause with the right URI and if the clause is optional or not */
        if (attributeMinCount === '0') {
          queries[label].where.push({
            type: 'optional',
            patterns: [
              {
                subject: { termType: 'Variable', value: 's' },
                predicate: {
                  termType: 'NamedNode',
                  value: attributeAssignedUri,
                },
                object: { termType: 'Variable', value: attributeLabel },
              },
            ],
          });
        } else {
          queries[label].where.push({
            type: 'bgp',
            triples: [
              {
                subject: { termType: 'Variable', value: 's' },
                predicate: {
                  termType: 'NamedNode',
                  value: attributeAssignedUri,
                },
                object: { termType: 'Variable', value: attributeLabel },
              },
            ],
          });
        }
      }
    }

    return queries;
  }

  private async writeQueries(queries: any) {
    // Require for importing due to limitations of the sparqljs library for importing in Typescript.
    const SparqlGenerator = require('sparqljs').Generator;

    /* Create output directory */
    ensureOutputDirectory(this.configuration.output);

    /* Serialize SPARQL queries and write them to a file */
    const generator = new SparqlGenerator();
    for (const i in queries) {
      const data = generator.stringify(queries[i]);
      writeFileSync(path.join(this.configuration.output, `${i}.sparql`), data);
    }
  }
}
