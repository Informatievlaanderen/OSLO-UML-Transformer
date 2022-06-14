import { writeFile } from 'fs/promises';
import type { GeneratorConfiguration } from '@oslo-flanders/configuration';
import { Generator } from '@oslo-flanders/core';
import { alphabeticalSort, extractLabel, toCamelCase, toPascalCase } from './utils/utils';

/**
 * Generates a JSON-LD context file based on the input file.
 * Currently implemented on JSON level
 */
export class JsonLdContextGenerator extends Generator<GeneratorConfiguration> {
  public async generate(data: any): Promise<void> {
    const document = JSON.parse(data);

    let duplicates: string[] = [];

    // If addDomainPrefix === false, then we only add the domain prefix for duplicates
    if (!this.configuration.addDomainPrefix) {
      duplicates = this.identifyDuplicates(document.attributes);
    }

    const context = this.generateContext(document, duplicates);
    await writeFile(this.configuration.output, JSON.stringify(context, null, 2));
  }

  private identifyDuplicates(attributes: any[]): string[] {
    const termUriMap = new Map<string, string[]>();
    const duplicates: string[] = [];

    attributes.forEach(attribute => {
      const languageLabel = extractLabel(attribute, this.configuration.language);

      if (!languageLabel) {
        this.logger.warn(`Unnable to find label in language '${this.configuration.language}' for attribute ${attribute['@id']}, skipping it.`);
        return;
      }

      termUriMap.set(languageLabel, [...termUriMap.get(languageLabel) || [], attribute['@id']]);
    });

    termUriMap.forEach((uris: string[], label: string) => {
      if (uris.length > 1) {
        duplicates.push(label);
      }
    });

    return duplicates;
  }

  public generateContext(document: any, duplicates: string[]): any {
    const classMap = this.classesToMap(document.classes);
    const propertyMap = this.propertiesToMap(document.attributes, duplicates);

    let context = Object.fromEntries(alphabeticalSort(Array.from(classMap.entries()))
      .map(([key, value]) => [key, value]));
    context = alphabeticalSort(Array.from(propertyMap.entries()))
      .reduce((main, [key, value]) => ({ ...main, [key]: { '@id': value.uri, '@type': value.range } }), context);

    return {
      '@context': context,
    };
  }

  private classesToMap(classes: any[]): Map<string, string> {
    const classLabelToUriMap = new Map<string, string>();

    classes.forEach(_class => {
      const languageLabel = extractLabel(_class, this.configuration.language);

      if (!languageLabel) {
        this.logger.warn(`Unnable to find label in language '${this.configuration.language}' for attribute ${_class['@id']}, skipping it.`);
        return;
      }

      classLabelToUriMap.set(toPascalCase(languageLabel), _class['@id']);
    });

    return classLabelToUriMap;
  }

  private propertiesToMap(properties: any[], duplicates: string[]): Map<string, { uri: string; range: string }> {
    const propertyLabelToUriMap = new Map<string, { uri: string; range: string }>();

    properties.forEach(property => {
      const languageLabel = extractLabel(property, this.configuration.language);

      if (!languageLabel) {
        this.logger.warn(`Unnable to find label in language '${this.configuration.language}' for attribute ${property['@id']}, skipping it.`);
        return;
      }

      const rangeObject = property.range;

      if (!rangeObject) {
        this.logger.warn(`Unnable to find range for attribute ${property['@id']}, skipping it.`);
        return;
      }

      let label = toCamelCase(languageLabel);
      if (this.configuration.addDomainPrefix || duplicates.includes(languageLabel)) {
        const domainObject: any = property.domain;

        if (!domainObject) {
          this.logger.warn(`Unnable to find domain for attribute ${property['@id']}, skipping it.`);
          return;
        }

        const domainLabel = extractLabel(domainObject, this.configuration.language);

        if (!domainLabel) {
          this.logger.warn(`Unnable to find label in language for domain of property ${property['@id']}, skipping it.`);
          return;
        }

        label = `${toPascalCase(domainLabel)}.${label}`;
      }

      propertyLabelToUriMap.set(label, { uri: property['@id'], range: rangeObject['@id'] });
    });

    return propertyLabelToUriMap;
  }
}
