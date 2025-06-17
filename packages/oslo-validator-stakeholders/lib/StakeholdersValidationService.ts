import {
  IService,
  Logger,
  QuadStore,
  ServiceIdentifier,
  fetchFileOrUrl,
  ns
} from '@oslo-flanders/core';
import { inject, injectable } from 'inversify';
import type * as RDF from '@rdfjs/types';
import { StakeholdersValidationServiceConfiguration } from './config/StakeholdersValidationServiceConfiguration';
import { Ajv } from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';

interface ValidationResult {
  isValid: boolean;
  invalidStakeholders: Array<string>;
}

const PREDICATES: string[] = [
  'http://xmlns.com/foaf/0.1/firstName',
  'http://xmlns.com/foaf/0.1/lastName',
  'http://xmlns.com/foaf/0.1/mbox',
  'http://xmlns.com/foaf/0.1/member',
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
];

@injectable()
export class StakeholdersValidationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: StakeholdersValidationServiceConfiguration;
  public readonly store: QuadStore;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration)
    configuration: StakeholdersValidationServiceConfiguration,
    @inject(ServiceIdentifier.QuadStore) store: QuadStore
  ) {
    this.logger = logger;
    this.configuration = configuration;
    this.store = store;
  }

  public async init(): Promise<void> {
  }

  public async run(): Promise<void> {
    const input = this.configuration.input;
    const format = this.configuration.format;

    switch (format) {
      case 'application/json':
        this.validateJSON(input);
        break;
      case 'application/ld+json':
        this.validateJSONLD(input);
        break;
      default:
        this.logger.error(`Unknown input format: ${format}`);
        break;
    }
  }

  private validateJSON(input: string) {
    const data = JSON.parse(fs.readFileSync(input, 'utf8'));
    const schema = JSON.parse(fs.readFileSync('schemas/stakeholders.json', 'utf8'));
    const validator = new Ajv();
    addFormats(validator);

    if (validator.validate(schema, data)) {
      this.logger.info('Stakeholder\'s JSON data is valid!');
    } else {
      throw new Error(`Stakeholder\'s JSON data is invalid! ${JSON.stringify(validator.errors, null, 2)}`)
    }
  }

  private validateJSONLD(input: string) {
    const data = JSON.parse(fs.readFileSync(input, 'utf8'));
    const schema = JSON.parse(fs.readFileSync('schemas/stakeholders.jsonld', 'utf8'));
    const validator = new Ajv();
    addFormats(validator);

    if (validator.validate(schema, data)) {
      this.logger.info('Stakeholder\'s JSON-LD data is valid!');
    } else {
      throw new Error(`Stakeholder\'s JSON-LD data is invalid! ${JSON.stringify(validator.errors, null, 2)}`)
    }
  }
}
