/* eslint-disable eslint-comments/disable-enable-pair */

import type { IService } from '@oslo-flanders/core';
import {
  QuadStore,
  ns,
  Logger,
  ServiceIdentifier,
  isStandardDatatype,
  getApplicationProfileLabel,
  getApplicationProfileDefinition,
  getApplicationProfileUsageNote,
  getMinCount,
  getMaxCount,
} from '@oslo-flanders/core';
import { writeFile } from 'fs/promises';
import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import { DataFactory } from 'rdf-data-factory';
import { SparqlGenerationServiceConfiguration } from './config/SparqlGenerationServiceConfiguration';

/* Regex for escaping URIs when using patterns in OpenAPI JSON */
const RE_DOT = /\./gi;
const RE_SLASH = /\//gi;

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
    /* Create Sparql as JSON */
    const swagger = this.createSparql();

    /* Write Sparql to file */
    await this.writeSparql(swagger);
  }

  public createSparql(): any {

  }

  public async writeSparql(swagger: Object) {
    const data = JSON.stringify(swagger, null, 2);

    await writeFile(this.configuration.output, data);
  }
}
