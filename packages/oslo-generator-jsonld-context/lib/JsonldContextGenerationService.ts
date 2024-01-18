/* eslint-disable eslint-comments/disable-enable-pair */
 
import { writeFile } from 'fs/promises';
import type { IService } from '@oslo-flanders/core';
import { Logger,
  ns,
  ServiceIdentifier,
 QuadStore } from '@oslo-flanders/core';

import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import {
  JsonldContextGenerationServiceConfiguration,
 } from '@oslo-generator-jsonld-context/config/JsonldContextGenerationServiceConfiguration';
import { alphabeticalSort, toCamelCase, toPascalCase } from '@oslo-generator-jsonld-context/utils/utils';

@injectable()
export class JsonldContextGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: JsonldContextGenerationServiceConfiguration;
  public readonly store: QuadStore;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration) config: JsonldContextGenerationServiceConfiguration,
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
    const context = await this.generateContext();

    const result = {
      '@context': context,
    };

    await writeFile(this.configuration.output, JSON.stringify(result, null, 2));
  }

  private async generateContext(): Promise<any> {
    const [classLabelUriMap, propertyLabelMap] = await Promise.all([
      this.createClassLabelUriMap(),
      this.createPropertyLabelMap(),
    ]);

    let context = Object.fromEntries(alphabeticalSort(Array.from(classLabelUriMap.entries()))
      .map(([key, value]) => [key, value]));

    context = alphabeticalSort(Array.from(propertyLabelMap.entries()))
      .reduce((main, [key, value]) =>
      ({
        ...main,
        [key]: {
          '@id': value.uri.value,
          ...value.range && { '@type': value.range.value },
          ...value.addContainer === true && { '@container': '@set' },
        },
      }), context);

    return context;
  }

  /**
   * Identifies labels that have been used two or more times for a different URI
   * @param uris — RDF.NamedNode validate their label is unique
   * @param store — In-memory quad store
   * @returns an array of RDF.NamedNode that have a label that is not unique
   */
  private identifyDuplicateLabels(uris: RDF.NamedNode[]): RDF.NamedNode[] {
    const labelUriMap: Map<string, RDF.NamedNode[]> = new Map();

    uris.forEach(uri => {
      const label = this.store.getLabel(uri, this.configuration.language);

      if (!label) {
        return;
      }

      const labelUris = labelUriMap.get(label.value) || [];
      labelUris.push(uri);
      labelUriMap.set(label.value, labelUris);
    });

    const duplicates: RDF.NamedNode[] = [];
    labelUriMap.forEach((subjects: RDF.NamedNode[], label: string) => {
      const unique = new Set(subjects);
      if (unique.size > 1) {
        duplicates.push(...Array.from(unique));
      }
    });

    return duplicates;
  }

  private async createClassLabelUriMap(): Promise<Map<string, RDF.NamedNode>> {
    const classLabelUriMap = new Map();

    const classSubjects = this.store.getClassIds();
    const duplicates = this.identifyDuplicateLabels(classSubjects);

    classSubjects.forEach(subject => {
      const label = this.store.getLabel(subject, this.configuration.language);

      if (!label) {
        this.logger.warn(`No label found for class ${subject.value} in language ${this.configuration.language}.`);
        return;
      }

      if (duplicates.includes(subject)) {
        this.logger.error(`Found ${subject.value} in duplicates, meaning "${label.value}" is used multiple times as label.`);
        return;
      }

      const assignedUri = this.store.getAssignedUri(subject);

      if (!assignedUri) {
        this.logger.error(`Unable to find the assigned URI for class ${subject.value}.`);
        return;
      }

      classLabelUriMap.set(toPascalCase(label.value), assignedUri.value);
    });

    return classLabelUriMap;
  }

  private async createPropertyLabelMap():
    Promise<Map<string, { uri: RDF.NamedNode; range: RDF.NamedNode; addContainer: boolean }>> {
    const propertyLabelUriMap = new Map();

    const datatypePropertySubjects = this.store.getDatatypePropertyIds();
    const objectPropertySubjects = this.store.getObjectPropertyIds();

    const duplicates = this.identifyDuplicateLabels([...datatypePropertySubjects, ...objectPropertySubjects]);

    [...datatypePropertySubjects, ...objectPropertySubjects].forEach(subject => {
      const assignedUri = this.store.getAssignedUri(subject);

      if (!assignedUri) {
        this.logger.error(`Unable to find the assigned URI for attribute ${subject.value}.`);
        return;
      }

      let label = this.store.getLabel(subject, this.configuration.language);
      if (!label) {
        // For labels it is possible to have a value without a language tag included
        label = this.store.getLabel(subject);
      }

      if (!label) {
        this.logger.error(`No label found for attribute ${subject.value} in language "${this.configuration.language}" or without language tag.`);
        return;
      }

      const range = this.store.getRange(subject);

      if (!range) {
        this.logger.error(`No range found for attribute ${subject.value}.`);
        return;
      }

      const rangeUri = this.store.getAssignedUri(range);

      // In case we can not find the assigned URI, we do not add a range
      // (@type will not be present for that property)
      if (!rangeUri) {
        this.logger.error(`Unable to find the assigned URI of range with id ${range.value}.`);
      }

      let formattedAttributeLabel = toCamelCase(label.value);
      if (this.configuration.addDomainPrefix || duplicates.includes(subject)) {
        const domain = this.store.getDomain(subject);
        if (!domain) {
          this.logger.error(`No domain found for attribute ${subject.value}.`);
          return;
        }

        let domainLabel = this.store.getLabel(domain, this.configuration.language);

        if (!domainLabel) {
          domainLabel = this.store.getLabelViaStatements(
            subject,
            ns.rdfs('domain'),
            domain,
            this.configuration.language,
          );
        }

        if (!domainLabel) {
          this.logger.error(`No label found for domain ${domain.value} of attribute ${subject.value}.`);
          return;
        }

        formattedAttributeLabel = `${toPascalCase(domainLabel.value)}.${formattedAttributeLabel}`;
      }

      const addContainerProperty = this.canHaveAListOfValues(subject);
      propertyLabelUriMap.set(formattedAttributeLabel, {
        uri: assignedUri,
        range: rangeUri,
        addContainer: addContainerProperty,
      });
    });

    return propertyLabelUriMap;
  }

  /**
   * Function to check if a property can have multiple values
   * @param subject — The Quad_Subject to check the cardinality of
   * @param store — The triple store to fetch triples about the Quad_Subject
   * @returns — A boolean indicating whether or not to add the "@container" property to the attribute
   */
  private canHaveAListOfValues(subject: RDF.Quad_Subject): boolean {
    const maxCount = this.store.getMaxCardinality(subject);

    if (!maxCount) {
      this.logger.warn(`Unable to retrieve max cardinality of property ${subject.value}.`);
      return false;
    }

    return maxCount.value === '*';
  }
}
