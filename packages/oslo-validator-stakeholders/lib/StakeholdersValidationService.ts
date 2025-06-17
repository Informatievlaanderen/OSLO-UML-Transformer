import {
  IService,
  Logger,
  QuadStore,
  ServiceIdentifier,
  fetchFileOrUrl,
  ns,
} from '@oslo-flanders/core';
import { inject, injectable } from 'inversify';
import type * as RDF from '@rdfjs/types';
import { StakeholdersValidationServiceConfiguration } from './config/StakeholdersValidationServiceConfiguration';

interface ValidationResult {
  isValid: boolean;
  invalidStakeholders: Array<{
    uri: string;
    location: string;
  }>;
}

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

    /* Read stakeholders JSON-LD */
    return this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    const result = this.validateStakeholders();

    if (result.isValid) {
      this.logger.info(
        'Validation successful! All stakeholders are valid.'
      );
    } else {
      this.logger.info(
        `Validation found ${result.invalidStakeholders.length} non-valid stakeholders`
      );
    }
  }

  private validateStakeholders(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      invalidStakeholders: []
    };

    /* Find all stakeholders */
    const quads = this.store.findQuads(null, ns.rdf('type'), ns.foaf('Person'));
    for (const quad of quads) {
      if (!this.validatePerson(person.subject)) {
        result.invalidStakeholders.push(person.subject);
      }
    }

    result.isValid = result.invalidStakeholders.length === 0;
    return result;
  }

  private validatePerson(NamedNode uri): boolean {
    let valid: boolean = false;
    const person = this.store.findQuads(uri, null, null);
    console.log(person);

    return valid;
  }
}
