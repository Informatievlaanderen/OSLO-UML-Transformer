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
import { ValidationResult } from './types/Validation';

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
    @inject(ServiceIdentifier.QuadStore) store: QuadStore,
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
    const resultUris = this.validateUris();
    const resultSentences = this.validateSentences();
    const resultLabels = this.validateLabels();
    const resultBaseURIs = this.validateBaseURIs();

    if (resultUris.isValid) {
      this.logger.info(
        'Validation successful! All assigned URIs are whitelisted.',
      );
    } else {
      this.logger.info(
        `Validation found ${resultUris.invalidEntries.length} non-whitelisted assigned URIs`,
      );
    }

    if (resultSentences.isValid) {
      this.logger.info(
        'Validation successful! All sentences seem to be valid, no spelling mistakes found.',
      );
    } else {
      this.logger.info(
        `Validation found ${resultSentences.invalidEntries.length} sentences with spelling mistakes.`,
      );
    }

    if (resultLabels.isValid) {
      this.logger.info(
        'Validation successful! All labels seem to be valid, no spelling mistakes found.',
      );
    } else {
      this.logger.info(
        `Validation found ${resultLabels.invalidEntries.length} labels with spelling mistakes.`,
      );
    }

    if (resultBaseURIs.isValid) {
      this.logger.info(
        'Validation successful! All base URIs seem to be valid.',
      );
    } else {
      this.logger.info(
        `Validation found ${resultLabels.invalidEntries.length} invalid base URIs.`,
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
          'Whitelist file must contain a JSON array of URI prefixes',
        );
      }

      if (!whitelistFromFile.length) {
        throw new Error(
          'Whitelist is empty. Must contain at least one URI prefix',
        );
      }

      this.whitelist = whitelistFromFile;
      this.logger.info(
        `Loaded ${this.whitelist.length} URI prefixes into whitelist`,
      );
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to load whitelist from ${filePath}`);
    }
  }

  private validateUris(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      invalidEntries: [],
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

    result.isValid = !result.invalidEntries.length;
    return result;
  }

  private validateTerm(
    term: RDF.Term,
    quad: RDF.Quad,
    result: ValidationResult,
  ): void {
    if (term.termType !== 'NamedNode') {
      return;
    }

    const uri = term.value;

    // Check if URI is in whitelist
    const isWhitelisted = this.whitelist.some(
      (prefix) => uri === prefix || uri.startsWith(prefix),
    );

    if (!isWhitelisted) {
      this.logger.warn(
        `Found non-whitelisted assigned URI: ${uri} for subject: ${quad.subject.value}`,
      );
      result.invalidEntries.push({
        uri,
        location: `as assigned URI for subject: ${quad.subject.value}`,
      });
    }
  }

  private validateSentences(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      invalidEntries: [],
    };

    // Find all quads with apDefinition, vocDefinition, apUsageNote, vocUsageNote predicate
    const apDefinitionPredicate = ns.oslo('apDefinition');
    const vocDefinitionPredicate = ns.oslo('vocDefinition');
    const apUsageNotePredicate = ns.oslo('apUsageNote');
    const vocUsageNotePredicate = ns.oslo('vocUsageNote');
    let quads: any[] = [
      ...this.store.findQuads(null, apDefinitionPredicate, null),
      ...this.store.findQuads(null, vocDefinitionPredicate, null),
      ...this.store.findQuads(null, apUsageNotePredicate, null),
      ...this.store.findQuads(null, vocUsageNotePredicate, null),
    ];

    for (const quad of quads) {
      if (quad.object.termType === 'Literal') {
        const uri: string = quad.subject.value;
        const value: string = quad.object.value;

        if (this.checkIsEmpty(value)) {
          this.logger.warn(`Found empty sentence for subject: ${uri}`);
          result.invalidEntries.push({
            uri,
            location: `Sentences may not be empty strings: ${value}`,
          });
          continue;
        }

        if (this.checkHasTODO(value)) {
          this.logger.warn(
            `Found a TODO or FIXME in sentence: '${value}' for subject: ${uri}`,
          );
          result.invalidEntries.push({
            uri,
            location: `Sentences must not contain any TODOs or FIXMEs: ${value}`,
          });
          continue;
        }

        if (!this.checkStartsWithCapital(value)) {
          this.logger.warn(
            `Found sentence without capital letter: '${value}' for subject: ${uri}`,
          );
          result.invalidEntries.push({
            uri,
            location: `Sentence must start with a capital: ${value}`,
          });
          continue;
        }

        if (!this.checkEndsWithDot(value)) {
          this.logger.warn(
            `Found sentence without a '.': '${value}' for subject: ${uri}`,
          );
          result.invalidEntries.push({
            uri,
            location: `Sentence must end with a '.': ${value}`,
          });
          continue;
        }
      }
    }

    result.isValid = !result.invalidEntries.length;
    return result;
  }

  private validateLabels(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      invalidEntries: [],
    };

    // Find all quads with apLabel, vocLabel predicate
    const apLabelPredicate = ns.oslo('apLabel');
    const vocLabelPredicate = ns.oslo('vocLabel');
    let quads: any[] = [
      ...this.store.findQuads(null, apLabelPredicate, null),
      ...this.store.findQuads(null, vocLabelPredicate, null),
    ];

    for (const quad of quads) {
      if (quad.object.termType === 'Literal') {
        const uri: string = quad.subject.value;
        const value: string = quad.object.value;

        if (this.checkIsEmpty(value)) {
          this.logger.warn(`Found empty label for subject: ${uri}`);
          result.invalidEntries.push({
            uri,
            location: `Labels may not be empty strings: ${value}`,
          });
          continue;
        }

        if (this.checkHasTODO(value)) {
          this.logger.warn(
            `Found a TODO or FIXME in label: '${value}' for subject: ${uri}`,
          );
          result.invalidEntries.push({
            uri,
            location: `Labels must not contain any TODOs or FIXMEs: ${value}`,
          });
          continue;
        }

        if (this.checkEndsWithDot(value)) {
          this.logger.warn(
            `Labels must not end with a '.': '${value}' for subject: ${uri}`,
          );
          result.invalidEntries.push({
            uri,
            location: `Label must not end with a '.': ${value}`,
          });
          continue;
        }

        if (!this.checkIsAlphanumeric(value)) {
          this.logger.warn(
            `Labels must only contain alphabetical characters: '${value}' for subject: ${uri}`,
          );
          result.invalidEntries.push({
            uri,
            location: `Label must only consist of alphabetical characters: ${value}`,
          });
          continue;
        }
      }
    }

    result.isValid = !result.invalidEntries.length;
    return result;
  }

  private validateBaseURIs(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      invalidEntries: [],
    };

    // Find all quads with apLabel, vocLabel predicate
    const baseURIPredicate = ns.oslo('baseURI');
    let quads: any[] = [...this.store.findQuads(null, baseURIPredicate, null)];

    for (const quad of quads) {
      if (quad.object.termType === 'NamedNode') {
        const uri: string = quad.subject.value;
        const value: string = quad.object.value;

        if (!this.checkEndsWithHashOrDash(value)) {
          this.logger.warn(`Found base URI without a hash or dash: ${uri}`);
          result.invalidEntries.push({
            uri,
            location: `Base URIs must end with a hash or dash: ${value}`,
          });
          continue;
        }

        if (this.checkHasTODO(value)) {
          this.logger.warn(`Found base URI with TODO or FIXME: ${uri}`);
          result.invalidEntries.push({
            uri,
            location: `Base URIs must not contain TODO or FIXME: ${value}`,
          });
          continue;
        }
      }
    }

    result.isValid = !result.invalidEntries.length;
    return result;
  }

  private checkIsEmpty(value: string): boolean {
    return value.length === 0;
  }

  private checkHasTODO(value: string): boolean {
    const v: string = value.toUpperCase();

    return (
      v.includes('TODO') ||
      v.includes('FIXME') ||
      v.includes('EXAMPLE.COM') ||
      v.includes('EXAMPLE.ORG')
    );
  }

  private checkEndsWithDot(value: string): boolean {
    return value[value.length - 1] === '.';
  }

  private checkStartsWithCapital(value: string): boolean {
    if (value.length > 0) {
      return value[0] === value[0].toUpperCase();
    }

    return false;
  }

  private checkIsAlphanumeric(value: string): boolean {
    return value.match(/^[a-zA-Z0-9\s]+$/i) !== null;
  }

  private checkEndsWithHashOrDash(value: string): boolean {
    return value.endsWith('#') || value.endsWith('/');
  }
}
