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
import { JsonldValidationServiceConfiguration } from './config/JsonldValidationServiceConfiguration';

interface ValidationResult {
  isValid: boolean;
  invalidUris: Array<{
    uri: string;
    location: string;
  }>;
}

@injectable()
export class JsonldValidationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: JsonldValidationServiceConfiguration;
  public readonly store: QuadStore;
  private whitelist: string[] = [];

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration)
    configuration: JsonldValidationServiceConfiguration,
    @inject(ServiceIdentifier.QuadStore) store: QuadStore
  ) {
    this.logger = logger;
    this.configuration = configuration;
    this.store = store;
  }

  public async init(): Promise<void> {
    if (this.configuration.whitelist) {
      await this.loadWhitelist(this.configuration.whitelist);
    }

    return this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    const result = this.validateUris();

    if (result.isValid) {
      this.logger.info(
        'Validation successful! All assigned URIs are whitelisted.'
      );
    } else {
      this.logger.info(
        `Validation found ${result.invalidUris.length} non-whitelisted assigned URIs`
      );
    }
  }

  private async loadWhitelist(filePath: string): Promise<void> {
    try {
      const buffer: Buffer = await fetchFileOrUrl(filePath);
      const content = buffer.toString();

      const whitelistFromFile = JSON.parse(content);

      if (!Array.isArray(whitelistFromFile)) {
        throw new Error(
          'Whitelist file must contain a JSON array of URI prefixes'
        );
      }

      if (!whitelistFromFile.length) {
        throw new Error(
          'Whitelist is empty. Must contain at least one URI prefix'
        );
      }

      this.whitelist = whitelistFromFile;
      this.logger.info(
        `Loaded ${this.whitelist.length} URI prefixes into whitelist`
      );
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to load whitelist from ${filePath}`);
    }
  }

  private validateUris(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      invalidUris: [],
    };

    // Find all quads with assignedURI predicate
    const assignedURIPredicate = ns.oslo('assignedURI');
    const quads = this.store.findQuads(null, assignedURIPredicate, null);

    for (const quad of quads) {
      // Only validate the object of assignedURI predicates
      if (quad.object.termType === 'NamedNode') {
        this.validateTerm(quad.object, quad, result);
      }
    }

    result.isValid = result.invalidUris.length === 0;
    return result;
  }

  private validateTerm(
    term: RDF.Term,
    quad: RDF.Quad,
    result: ValidationResult
  ): void {
    if (term.termType !== 'NamedNode') {
      return;
    }

    const uri = term.value;

    // Check if URI is in whitelist
    const isWhitelisted = this.whitelist.some(
      (prefix) => uri === prefix || uri.startsWith(prefix)
    );

    if (!isWhitelisted) {
      this.logger.warn(
        `Found non-whitelisted assigned URI: ${uri} for subject: ${quad.subject.value}`
      );
      result.invalidUris.push({
        uri,
        location: `as assigned URI for subject: ${quad.subject.value}`,
      });
    }
  }
}
