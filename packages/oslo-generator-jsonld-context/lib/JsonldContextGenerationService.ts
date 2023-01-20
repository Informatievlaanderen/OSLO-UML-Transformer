/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/indent */
import { writeFile } from 'fs/promises';
import type { IGenerationService } from '@oslo-flanders/core';
import { Logger, ns, createN3Store, ServiceIdentifier } from '@oslo-flanders/core';

import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import type * as N3 from 'n3';
import { JsonldContextGenerationServiceConfiguration } from './config/JsonldContextGenerationServiceConfiguration';
import { alphabeticalSort, getLabel, toCamelCase, toPascalCase } from './utils/utils';

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

    const [classLabelUriMap, propertyLabelMap] = await Promise.all([
      this.createClassLabelUriMap(store),
      this.createPropertyLabelMap(store),
    ]);

    let context = Object.fromEntries(alphabeticalSort(Array.from(classLabelUriMap.entries()))
      .map(([key, value]) => [key, value]));

    context = alphabeticalSort(Array.from(propertyLabelMap.entries()))
      .reduce((main, [key, value]) =>
        // eslint-disable-next-line @typescript-eslint/object-curly-spacing
        ({ ...main, [key]: { '@id': value.uri.value, '@type': value.range.value } }), context);

    const result = {
      '@context': context,
    };

    await writeFile(this.configuration.output, JSON.stringify(result, null, 2));
  }

  private identifyDuplicates(uris: RDF.Quad_Subject[]): RDF.Quad_Subject[] {
    const unique = new Set(uris);
    // eslint-disable-next-line array-callback-return
    return uris.filter(uri => {
      if (unique.has(uri)) {
        unique.delete(uri);
      } else {
        return uri;
      }
    });
  }

  private async createClassLabelUriMap(store: N3.Store): Promise<Map<string, RDF.NamedNode>> {
    const classLabelUriMap = new Map();

    const classSubjects = store.getSubjects(ns.rdf('type'), ns.owl('Class'), null);
    const duplicates = this.identifyDuplicates(classSubjects);

    classSubjects.forEach(subject => {
      const label = getLabel(subject, this.configuration.language, store);

      if (duplicates.includes(subject)) {
        this.logger.warn(`URI ${subject.value} is used two or more times for a class, which is not allowed.`);
      }

      if (!label) {
        this.logger.error(`No label found for class ${subject.value} in language ${this.configuration.language}. Class will be skipped`);
        return;
      }

      classLabelUriMap.set(toPascalCase(label.value), subject.value);
    });

    return classLabelUriMap;
  }

  private async createPropertyLabelMap(store: N3.Store):
    Promise<Map<string, { uri: RDF.NamedNode; range: RDF.NamedNode }>> {
    const propertyLabelUriMap = new Map();

    const datatypePropertySubjects = store.getSubjects(ns.rdf('type'), ns.owl('DatatypeProperty'), null);
    const objectPropertySubjects = store.getSubjects(ns.rdf('type'), ns.owl('ObjectProperty'), null);

    const duplicates = this.identifyDuplicates([...datatypePropertySubjects, ...objectPropertySubjects]);

    [...datatypePropertySubjects, ...objectPropertySubjects].forEach(subject => {
      const attributeLabels = store.getObjects(subject, ns.rdfs('label'), null);
      const languageAttributeLabels = attributeLabels
        .filter(x => (<RDF.Literal>x).language === this.configuration.language || (<RDF.Literal>x).language === '');

      if (languageAttributeLabels.length === 0) {
        this.logger.error(`No label found for attribute ${subject.value} in language ${this.configuration.language}.`);
        return;
      }
      const attributeLabel = languageAttributeLabels.shift()!;

      const ranges = store.getObjects(subject, ns.rdfs('range'), null);

      if (ranges.length === 0) {
        this.logger.error(`No range found for attribute ${subject.value}`);
        return;
      }

      const range = ranges[0];

      let formattedAttributeLabel = toCamelCase(attributeLabel.value);
      if (this.configuration.addDomainPrefix || duplicates.includes(subject)) {
        const domains = store.getObjects(subject, ns.rdfs('domain'), null);
        if (domains.length === 0) {
          this.logger.error(`No domain found for attribute ${subject.value} which is needed.`);
          return;
        }

        const domain = domains[0];
        let domainLabels = store.getObjects(domain, ns.rdfs('label'), null);

        if (domainLabels.length === 0) {
          const statementIds = store.getSubjects(ns.rdf('type'), ns.rdf('Statement'), null);
          const statementSubjectPredicateSubjects = store.getSubjects(ns.rdf('subject'), subject, null);
          const statementPredicatePredicateSubjects = store.getSubjects(ns.rdf('predicate'), ns.rdfs('domain'), null);
          const statementObjectPredicateSubjects = store.getSubjects(ns.rdf('object'), domain, null);

          const targetSubjectSet = new Set([
            ...statementIds,
            ...statementSubjectPredicateSubjects,
            ...statementPredicatePredicateSubjects,
            ...statementObjectPredicateSubjects,
          ]);

          if (targetSubjectSet.size > 1) {
            this.logger.error(`Found multiple usable subjects for the statement`);
            return;
          }

          const [targetSubject] = targetSubjectSet;
          domainLabels = store.getObjects(targetSubject, ns.rdfs('label'), null);
        }

        const domainLabel = domainLabels
          .find(x => (<RDF.Literal>x).language === this.configuration.language || (<RDF.Literal>x).language === '');

        if (!domainLabel) {
          this.logger.error(`No label found for domain ${domain.value} of attribute ${subject.value}`);
          return;
        }

        formattedAttributeLabel = `${toPascalCase(domainLabel.value)}.${formattedAttributeLabel}`;
      }

      propertyLabelUriMap.set(formattedAttributeLabel, { uri: subject, range });
    });

    return propertyLabelUriMap;
  }
}
