import { writeFile } from 'fs/promises';
import type { GeneratorConfiguration } from '@oslo-flanders/configuration';
import { Generator } from '@oslo-flanders/core';
import { extractDescription, extractDomainLabel, extractLabel, extractUsageNote } from './utils/utils';

export class TranslationJsonGenerator extends Generator<GeneratorConfiguration> {
  public async generate(data: string): Promise<void> {
    const document = JSON.parse(data);

    const [translationClasses, translationProperties] = await Promise.all([
      this.createTranslationClasses(document.classes),
      this.createTranslationProperties(document.attributes),
    ]);

    // Normally there should only be one package
    const baseUri = document.packages[0].baseUri;

    const output = {
      baseUri,
      classes: translationClasses,
      attributes: translationProperties,
    };

    await writeFile(this.configuration.translationFileOutput, JSON.stringify(output, null, 2));
  }

  private async createTranslationClasses(classes: any[]): Promise<any[]> {
    return classes.reduce((translationClasses: any[], classObject: any) => {
      const label = extractLabel(classObject, this.configuration.language);
      const description = extractDescription(classObject, this.configuration.language);
      const usageNote = extractUsageNote(classObject, this.configuration.language);

      if (!label || !description) {
        this.logger.error(`Unnable to find label or description in language ${this.configuration.language} for class ${classObject['@id']}, skipping it.`);
        return translationClasses;
      }

      if (!usageNote) {
        this.logger.warn(`Unnable to find usageNote in language ${this.configuration.language} for class ${classObject['@id']}, property will be empty.`);
      }

      const translationClassObject: any = {
        id: classObject['@id'],
        guid: classObject.guid,
        label: {},
        definition: {},
        usageNote: {},
      };

      translationClassObject.label[this.configuration.language] = label;
      translationClassObject.label[this.configuration.targetLanguage] = 'Enter your translation here';
      translationClassObject.definition[this.configuration.language] = description;
      translationClassObject.definition[this.configuration.targetLanguage] = 'Enter your translation here';

      if (usageNote) {
        translationClassObject.usageNote[this.configuration.language] = usageNote;
      }

      translationClassObject.usageNote[this.configuration.targetLanguage] = 'Enter your translation here';

      translationClasses.push(translationClassObject);
      return translationClasses;
    }, []);
  }

  // TODO: range is not language-aware yet.
  private async createTranslationProperties(properties: any[]): Promise<any[]> {
    return properties.reduce((translationProperties: any[], property: any) => {
      const label = extractLabel(property, this.configuration.language);
      const description = extractDescription(property, this.configuration.language);
      const usageNote = extractUsageNote(property, this.configuration.language);
      const domainLabel = extractDomainLabel(property, this.configuration.language);

      if (!label || !description || !domainLabel) {
        this.logger.error(`Unnable to find label, description or label for domain in language ${this.configuration.language} for property ${property['@id']}, skipping it.`);
        return translationProperties;
      }

      if (!usageNote) {
        this.logger.warn(`Unnable to find usageNote in language ${this.configuration.language} for property ${property['@id']}, property will be empty.`);
      }

      const translationPropertyObject: any = {
        id: property['@id'],
        guid: property.guid,
        label: {},
        definition: {},
        usageNote: {},
        domain: {},
      };

      translationPropertyObject.label[this.configuration.language] = label;
      translationPropertyObject.label[this.configuration.targetLanguage] = 'Enter your translation here';
      translationPropertyObject.definition[this.configuration.language] = description;
      translationPropertyObject.definition[this.configuration.targetLanguage] = 'Enter your translation here';
      translationPropertyObject.domain = {
        id: property.domain['@id'],
      };
      translationPropertyObject.domain[this.configuration.language] = domainLabel;
      translationPropertyObject.domain[this.configuration.targetLanguage] = 'Enter your translation here';

      if (usageNote) {
        translationPropertyObject.usageNote[this.configuration.language] = usageNote;
      }

      translationPropertyObject.usageNote[this.configuration.targetLanguage] = 'Enter your translation here';

      translationProperties.push(translationPropertyObject);
      return translationProperties;
    }, []);
  }
}
