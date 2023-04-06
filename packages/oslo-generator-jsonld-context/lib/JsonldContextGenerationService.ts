/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/indent */
import { writeFile } from 'fs/promises';
import type { IGenerationService } from '@oslo-flanders/core';
import {
  getAssignedUri,
  getDomain,
  getLabel,
  getLabelViaStatements,
  getRange,
  Logger,
  ns,
  createN3Store,
  ServiceIdentifier,
} from '@oslo-flanders/core';

import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import type * as N3 from 'n3';
import { JsonldContextGenerationServiceConfiguration } from './config/JsonldContextGenerationServiceConfiguration';
import { alphabeticalSort, toCamelCase, toPascalCase } from './utils/utils';

@injectable()
export class JsonldContextGenerationService implements IGenerationService {
  public readonly logger: Logger;
  public readonly configuration: JsonldContextGenerationServiceConfiguration;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration) config: JsonldContextGenerationServiceConfiguration,
  ) {
    this.logger = logger;
    this.configuration = config;
  }

  public async run(): Promise<void> {
    const store = await createN3Store(this.configuration.input);
    const context = await this.generateContext(store);

    const result = {
      '@context': context,
    };

    await writeFile(this.configuration.output, JSON.stringify(result, null, 2));
  }

  private async generateContext(store: N3.Store): Promise<any> {
    const [classLabelUriMap, propertyLabelMap] = await Promise.all([
      this.createClassLabelUriMap(store),
      this.createPropertyLabelMap(store),
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
   * @param uris — RDF.Quad_Subjects validate their label is unique
   * @param store — In-memory quad store
   * @returns an array of RDF.Quad_Subjects that have a label that is not unique
   */
  private identifyDuplicateLabels(uris: RDF.Quad_Subject[], store: N3.Store): RDF.Quad_Subject[] {
    const labelUriMap: Map<string, RDF.Quad_Subject[]> = new Map();

    uris.forEach(uri => {
      const label = getLabel(uri, store, this.configuration.language);

      if (!label) {
        return;
      }

      const labelUris = labelUriMap.get(label.value) || [];
      labelUris.push(uri);
      labelUriMap.set(label.value, labelUris);
    });

    const duplicates: RDF.Quad_Subject[] = [];
    labelUriMap.forEach((subjects: RDF.Quad_Subject[], label: string) => {
      const unique = new Set(subjects);
      if (unique.size > 1) {
        duplicates.push(...Array.from(unique));
      }
    });

    return duplicates;
  }

  private async createClassLabelUriMap(store: N3.Store): Promise<Map<string, RDF.NamedNode>> {
    const classLabelUriMap = new Map();

    const classSubjects = store.getSubjects(ns.rdf('type'), ns.owl('Class'), null);
    const duplicates = this.identifyDuplicateLabels(classSubjects, store);

    classSubjects.forEach(subject => {
      const label = getLabel(subject, store, this.configuration.language);

      if (!label) {
        this.logger.warn(`No label found for class ${subject.value} in language ${this.configuration.language}.`);
        return;
      }

      if (duplicates.includes(subject)) {
        this.logger.error(`Found ${subject.value} in duplicates, meaning "${label.value}" is used multiple times as label.`);
        return;
      }

      const assignedUri = getAssignedUri(subject, store);

      if (!assignedUri) {
        this.logger.error(`Unable to find the assigned URI for class ${subject.value}.`);
        return;
      }

      classLabelUriMap.set(toPascalCase(label.value), assignedUri.value);
    });

    return classLabelUriMap;
  }

  private async createPropertyLabelMap(store: N3.Store):
    Promise<Map<string, { uri: RDF.NamedNode; range: RDF.NamedNode; addContainer: boolean }>> {
    const propertyLabelUriMap = new Map();

    const datatypePropertySubjects = store.getSubjects(ns.rdf('type'), ns.owl('DatatypeProperty'), null);
    const objectPropertySubjects = store.getSubjects(ns.rdf('type'), ns.owl('ObjectProperty'), null);

    const duplicates = this.identifyDuplicateLabels([...datatypePropertySubjects, ...objectPropertySubjects], store);

    [...datatypePropertySubjects, ...objectPropertySubjects].forEach(subject => {
      const assignedUri = getAssignedUri(subject, store);

      if (!assignedUri) {
        this.logger.error(`Unable to find the assigned URI for attribute ${subject.value}.`);
        return;
      }

      let label = getLabel(subject, store, this.configuration.language);
      if (!label) {
        // For labels it is possible to have a value without a language tag included
        label = getLabel(subject, store);
      }

      if (!label) {
        this.logger.error(`No label found for attribute ${subject.value} in language "${this.configuration.language}" or without language tag.`);
        return;
      }

      const range = getRange(subject, store);

      if (!range) {
        this.logger.error(`No range found for attribute ${subject.value}.`);
        return;
      }

      const rangeUri = getAssignedUri(<RDF.Quad_Subject>range, store);

      // In case we can not find the assigned URI, we do not add a range
      // (@type will not be present for that property)
      if (!rangeUri) {
        this.logger.error(`Unable to find the assigned URI of range with id ${range.value}.`);
      }

      let formattedAttributeLabel = toCamelCase(label.value);
      if (this.configuration.addDomainPrefix || duplicates.includes(subject)) {
        const domain = getDomain(subject, store);
        if (!domain) {
          this.logger.error(`No domain found for attribute ${subject.value}.`);
          return;
        }

        let domainLabel = getLabel(domain, store, this.configuration.language);

        if (!domainLabel) {
          domainLabel = getLabelViaStatements(
            subject,
            ns.rdfs('domain'),
            domain,
            store,
            this.configuration.language,
          );
        }

        if (!domainLabel) {
          this.logger.error(`No label found for domain ${domain.value} of attribute ${subject.value}.`);
          return;
        }

        formattedAttributeLabel = `${toPascalCase(domainLabel.value)}.${formattedAttributeLabel}`;
      }

      const addContainerProperty = this.canHaveAListOfValues(subject, store);
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
  private canHaveAListOfValues(subject: RDF.Quad_Subject, store: N3.Store): boolean {
    const maxCount = store.getObjects(subject, ns.shacl('maxCount'), null).shift();

    if (!maxCount) {
      this.logger.warn(`Unable to retrieve max cardinality of property ${subject.value}.`);
      return false;
    }

    return maxCount.value === '*';
  }
}
