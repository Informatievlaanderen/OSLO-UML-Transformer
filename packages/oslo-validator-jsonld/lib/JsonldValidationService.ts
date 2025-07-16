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
import { InvalidEntry, ValidationResult } from './types/Validation';

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
    const resultUris = this.validateUris();
    const resultSentences = this.validateSentences();
    const resultDefinitionExistence = this.validateDefinitionExistence();
    const resultLabels = this.validateLabels();
    const resultBaseURIs = this.validateBaseURIs();

    if (resultUris.isValid) {
      this.logger.info(
        'Validation successful! All assigned URIs are whitelisted.'
      );
    } else {
      this.logger.info(
        `Validation found ${resultUris.invalidEntries.length} non-whitelisted assigned URIs`
      );
    }

    if (resultSentences.isValid) {
      this.logger.info(
        'Validation successful! All sentences seem to be valid, no spelling mistakes found.'
      );
    } else {
      this.logger.info(
        `Validation found ${resultSentences.invalidEntries.length} sentences with spelling mistakes`
      );
    }

    if (resultDefinitionExistence.isValid) {
      this.logger.info(
        'Validation successful! All definitions seem to be present.'
      );
    } else {
      this.logger.info(
        `Validation found ${resultDefinitionExistence.invalidEntries.length} definitions with missing content`
      );
    }

    if (resultLabels.isValid) {
      this.logger.info(
        'Validation successful! All labels seem to be valid, no spelling mistakes found.'
      );
    } else {
      this.logger.info(
        `Validation found ${resultLabels.invalidEntries.length} labels with spelling mistakes.`
      );
    }

    if (resultBaseURIs.isValid) {
      this.logger.info(
        'Validation successful! All base URIs seem to be valid.'
      );
    } else {
      this.logger.info(
        `Validation found ${resultLabels.invalidEntries.length} invalid base URIs.`
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
      result.invalidEntries.push({
        uri,
        location: `as assigned URI for subject: ${quad.subject.value}`,
      });
    }
  }


  private validateDefinitionExistence(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      invalidEntries: [],
    };

    // Find all quads with apLabel and vocLabel to get all entities
    const apLabelPredicate = ns.oslo('apLabel');
    const vocLabelPredicate = ns.oslo('vocLabel');

    let labelQuads: RDF.Quad[] = [
      ...this.store.findQuads(null, apLabelPredicate, null),
      ...this.store.findQuads(null, vocLabelPredicate, null),
    ];

    // Get unique subjects from label quads
    const uniqueSubjects = new Set(
      labelQuads.map((quad) => quad.subject.value)
    );

    for (const subjectValue of uniqueSubjects) {
      const subject = labelQuads.find(
        (quad) => quad.subject.value === subjectValue
      )?.subject;
      if (!subject) continue;

      // Check what types of labels exist for this subject
      const hasApLabel =
        this.store.findQuads(subject, ns.oslo('apLabel'), null).length === 1;
      const hasVocLabel =
        this.store.findQuads(subject, ns.oslo('vocLabel'), null).length === 1;

      // Get the assignedURI for this subject to check domain
      const assignedURIQuads = this.store.findQuads(
        subject,
        ns.oslo('assignedURI'),
        null
      );
      const assignedURI =
        assignedURIQuads.length > 0 ? assignedURIQuads[0].object.value : null;
      const isInPublicationEnvironment: boolean = assignedURI
        ? assignedURI.includes(this.configuration.publicationEnvironment)
        : false;

      // Check for definitions
      const apDefinitions = this.store.findQuads(
        subject,
        ns.oslo('apDefinition'),
        null
      );
      const vocDefinitions = this.store.findQuads(
        subject,
        ns.oslo('vocDefinition'),
        null
      );

      // Validation logic based on domain and labels
      if (isInPublicationEnvironment) {
        // For publication environment domain: match definitions to labels
        if (hasApLabel && hasVocLabel) {
          // Both labels exist - At least one definition is required
          if (!apDefinitions.length && !vocDefinitions.length) {
            this.logger.warn(
              `Missing either apDefinition or vocDefinition for ${this.configuration.publicationEnvironment} subject with both apLabel and vocLabel: ${subjectValue}`
            );
            result.invalidEntries.push({
              uri: subjectValue,
              location: `Entity with both apLabel and vocLabel from ${this.configuration.publicationEnvironment} domain must have either apDefinition or vocDefinition`,
            });
          }
        } else if (hasApLabel && !hasVocLabel) {
          // Only apLabel exists - apDefinition is required
          if (!apDefinitions.length && !vocDefinitions.length) {
            this.logger.warn(
              `Missing apDefinition for ${this.configuration.publicationEnvironment} subject with apLabel: ${subjectValue}`
            );
            result.invalidEntries.push({
              uri: subjectValue,
              location: `Entity with apLabel from ${this.configuration.publicationEnvironment} domain must have apDefinition`,
            });
          } else if (vocDefinitions.length) {
            // Using vocDefinition as fallback
            this.logger.info(
              `Using vocDefinition as fallback for subject without apDefinition: ${subjectValue}`
            );
          }
        } else if (!hasApLabel && hasVocLabel) {
          // Only vocLabel exists - vocDefinition is required
          if (!vocDefinitions.length) {
            this.logger.warn(
              `Missing vocDefinition for ${this.configuration.publicationEnvironment} subject with vocLabel: ${subjectValue}`
            );
            result.invalidEntries.push({
              uri: subjectValue,
              location: `Entity with vocLabel from ${this.configuration.publicationEnvironment} domain must have vocDefinition`,
            });
          }
        }
      } else {
        // For external domains: apDefinition is preferred, vocDefinition can be fallback
        if (!apDefinitions.length && !vocDefinitions.length) {
          this.logger.warn(
            `Missing either apDefinition or vocDefinition for external domain subject: ${subjectValue}`
          );
          result.invalidEntries.push({
            uri: subjectValue,
            location: `Entity from external domain must have either apDefinition or vocDefinition`,
          });
        } else if (!apDefinitions.length && vocDefinitions.length) {
          // Using vocDefinition as fallback for external entity
          this.logger.info(
            `Using vocDefinition as fallback for external entity without apDefinition: ${subjectValue}`
          );
        }
      }
    }

    result.isValid = !result.invalidEntries.length;
    return result;
  }

  private validateSentences(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      invalidEntries: [],
    };

    // Find all definition and usage note quads
    const apDefinitionQuads = this.store.findQuads(
      null,
      ns.oslo('apDefinition'),
      null
    );
    const vocDefinitionQuads = this.store.findQuads(
      null,
      ns.oslo('vocDefinition'),
      null
    );
    const apUsageNoteQuads = this.store.findQuads(
      null,
      ns.oslo('apUsageNote'),
      null
    );
    const vocUsageNoteQuads = this.store.findQuads(
      null,
      ns.oslo('vocUsageNote'),
      null
    );

    const allDefinitions = [...apDefinitionQuads, ...vocDefinitionQuads];
    const allUsageNotes = [...apUsageNoteQuads, ...vocUsageNoteQuads];

    result.invalidEntries = [
      ...result.invalidEntries,
      // Validate all existing definitions for spelling/format issues
      ...this.validateDefinitions(allDefinitions),
      // Validate usage notes if they exist for spelling/format issues
      ...this.validateUsageNotes(allUsageNotes),
    ];

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
            `Found a TODO or FIXME in label: '${value}' for subject: ${uri}`
          );
          result.invalidEntries.push({
            uri,
            location: `Labels must not contain any TODOs or FIXMEs: ${value}`,
          });
          continue;
        }

        if (this.checkEndsWithDot(value)) {
          this.logger.warn(
            `Labels must not end with a '.': '${value}' for subject: ${uri}`
          );
          result.invalidEntries.push({
            uri,
            location: `Label must not end with a '.': ${value}`,
          });
          continue;
        }

        if (!this.checkIsAlphanumeric(value)) {
          this.logger.warn(
            `Labels must only contain alphabetical characters: '${value}' for subject: ${uri}`
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

  private validateDefinitions(definitions: RDF.Quad[]): InvalidEntry[] {
    const invalidEntries: InvalidEntry[] = [];
    for (const quad of definitions) {
      if (quad.object.termType === 'Literal') {
        const uri: string = quad.subject.value;
        const value: string = quad.object.value;

        if (this.checkIsEmpty(value)) {
          this.logger.warn(`Found empty definition for subject: ${uri}`);
          invalidEntries.push({
            uri,
            location: `Definitions may not be empty strings: ${value}`,
          });
          continue;
        }

        if (this.checkHasTODO(value)) {
          this.logger.warn(
            `Found a TODO or FIXME in definition: '${value}' for subject: ${uri}`
          );
          invalidEntries.push({
            uri,
            location: `Definitions must not contain any TODOs or FIXMEs: ${value}`,
          });
          continue;
        }

        if (!this.checkStartsWithCapital(value)) {
          this.logger.warn(
            `Found definition without capital letter: '${value}' for subject: ${uri}`
          );
          invalidEntries.push({
            uri,
            location: `Definition must start with a capital: ${value}`,
          });
          continue;
        }

        if (!this.checkEndsWithDot(value)) {
          this.logger.warn(
            `Found definition without a '.': '${value}' for subject: ${uri}`
          );
          invalidEntries.push({
            uri,
            location: `Definition must end with a '.': ${value}`,
          });
          continue;
        }
      }
    }
    return invalidEntries;
  }

  private validateUsageNotes(usageNotes: RDF.Quad[]): InvalidEntry[] {
    const invalidEntries: InvalidEntry[] = [];
    for (const quad of usageNotes) {
      if (quad.object.termType === 'Literal') {
        const uri: string = quad.subject.value;
        const value: string = quad.object.value;

        if (this.checkIsEmpty(value)) {
          this.logger.warn(`Found empty usage note for subject: ${uri}`);
          invalidEntries.push({
            uri,
            location: `Usage notes may not be empty strings: ${value}`,
          });
          continue;
        }

        if (this.checkHasTODO(value)) {
          this.logger.warn(
            `Found a TODO or FIXME in usage note: '${value}' for subject: ${uri}`
          );
          invalidEntries.push({
            uri,
            location: `Usage notes must not contain any TODOs or FIXMEs: ${value}`,
          });
          continue;
        }

        if (!this.checkStartsWithCapital(value)) {
          this.logger.warn(
            `Found usage note without capital letter: '${value}' for subject: ${uri}`
          );
          invalidEntries.push({
            uri,
            location: `Usage note must start with a capital: ${value}`,
          });
          continue;
        }

        if (!this.checkEndsWithDot(value)) {
          this.logger.warn(
            `Found usage note without a '.': '${value}' for subject: ${uri}`
          );
          invalidEntries.push({
            uri,
            location: `Usage note must end with a '.': ${value}`,
          });
          continue;
        }
      }
    }
    return invalidEntries;
  }

  private checkIsEmpty(value: string): boolean {
    return !value.length;
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
