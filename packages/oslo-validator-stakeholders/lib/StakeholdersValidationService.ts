import {
  IService,
  Logger,
  QuadStore,
  ServiceIdentifier,
  fetchFileOrUrl,
  ns,
} from '@oslo-flanders/core';
import path from 'path';
import { inject, injectable } from 'inversify';
import type * as RDF from '@rdfjs/types';
import { StakeholdersValidationServiceConfiguration } from './config/StakeholdersValidationServiceConfiguration';
import { Ajv } from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import { Schemas } from './enums/Schemas';

@injectable()
export class StakeholdersValidationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: StakeholdersValidationServiceConfiguration;
  public readonly store: QuadStore;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration)
    configuration: StakeholdersValidationServiceConfiguration,
    @inject(ServiceIdentifier.QuadStore) store: QuadStore,
  ) {
    this.logger = logger;
    this.configuration = configuration;
    this.store = store;
  }

  public async init(): Promise<void> {}

  public async run(): Promise<void> {
    const input = this.configuration.input;
    const format = this.configuration.format;

    switch (format) {
      case 'application/json':
        await this.validateJSON(input);
        break;
      case 'application/ld+json':
        await this.validateJSONLD(input);
        break;
      default:
        this.logger.error(`Unknown input format: ${format}`);
        break;
    }
  }

  private async validateJSON(input: string) {
    const bufferData: Buffer = await fetchFileOrUrl(input);
    const data: { [index: string]: any } = JSON.parse(bufferData.toString());
    const bufferSchema: Buffer = await fetchFileOrUrl(Schemas.Json);
    const schema: { [index: string]: any } = JSON.parse(
      bufferSchema.toString(),
    );
    const validator = new Ajv();
    addFormats(validator);

    if (validator.validate(schema, data) && data) {
      this.logger.info("Stakeholder's JSON data is valid!");
      const stakeholders = [
        ...data['editors'],
        ...data['contributors'],
        ...data['authors'],
      ];
      for (const stakeholder of stakeholders) {
        if (!stakeholder['affiliation']['homepage'].includes('OVO'))
          this.logger.warn(
            `Stakeholder does not have an OVO code: ${stakeholder['affiliation']['homepage']}`,
          );
      }
    } else {
      throw new Error(
        `Stakeholder\'s JSON data is invalid! ${JSON.stringify(validator.errors, null, 2)}`,
      );
    }
  }

  private async validateJSONLD(input: string) {
    const bufferData: Buffer = await fetchFileOrUrl(input);
    const data: { [index: string]: any } = JSON.parse(bufferData.toString());
    const bufferSchema: Buffer = await fetchFileOrUrl(Schemas.JsonLd);
    const schema: { [index: string]: any } = JSON.parse(
      bufferSchema.toString(),
    );
    const validator = new Ajv();
    addFormats(validator);

    if (validator.validate(schema, data)) {
      this.logger.info("Stakeholder's JSON-LD data is valid!");
    } else {
      throw new Error(
        `Stakeholder\'s JSON-LD data is invalid! ${JSON.stringify(validator.errors, null, 2)}`,
      );
    }
  }
}
