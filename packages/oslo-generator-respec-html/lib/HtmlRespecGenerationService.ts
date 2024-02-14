import { writeFile, mkdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import type { IService } from '@oslo-flanders/core';
import { ns, Logger, QuadStore, ServiceIdentifier } from '@oslo-flanders/core';

import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import * as nj from 'nunjucks';
import {
  HtmlRespecGenerationServiceConfiguration,
} from '@oslo-generator-respec-html/config/HtmlRespecGenerationServiceConfiguration';
import { alphabeticalSort } from '@oslo-generator-respec-html/utils/alphabeticalSort';
import { isInScope } from '@oslo-generator-respec-html/utils/scopeFilter';
import { SpecificationType } from '@oslo-generator-respec-html/utils/specificationTypeEnum';

@injectable()
export class HtmlRespecGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: HtmlRespecGenerationServiceConfiguration;
  public readonly store: QuadStore;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration) config: HtmlRespecGenerationServiceConfiguration,
    @inject(ServiceIdentifier.QuadStore) store: QuadStore,
  ) {
    this.logger = logger;
    this.configuration = config;
    this.store = store;
  }

  public async init(): Promise<void> {
    nj.configure(resolve(`${__dirname}/templates`));
    await this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    const [classes, attributes, config] = await Promise.all([
      this.extractClassInformation(),
      this.extractPropertyInformation(),
      this.createRespecConfig(),
    ]);

    const indexPath = this.configuration.specificationType === SpecificationType.Vocabulary ?
      'vocabulary/index.njk' :
      'application-profile/index.njk';

    let data: any = {};
    if (this.configuration.specificationType === SpecificationType.ApplicationProfile) {
      this.groupPropertiesPerDomain(classes, attributes);
      data = classes;
    } else {
      data.classes = classes;
      data.properties = attributes;
    }

    const html = nj.render(indexPath, {
      specName: this.configuration.specificationName,
      respecConfig: config,
      data,
    });

    const dirPath = dirname(this.configuration.output);
    await mkdir(dirPath, { recursive: true });

    await writeFile(this.configuration.output, html);
  }

  private async createRespecConfig(): Promise<any> {
    const respecConfig = {
      specStatus: 'unofficial',
      editors: [
        {
          name: 'John Doe',
        },
      ],
      publishDate: new Date().toISOString(),
    };

    return `${JSON.stringify(respecConfig)}`;
  }

  private groupPropertiesPerDomain(classes: any[], properties: any[]): void {
    properties.forEach(property => {
      const classObject = classes.find(x => x.id === property.domain);

      if (!classObject) {
        this.logger.error(`Unable to find a related class object for domain ${property.domain} of property ${property.assignedUri}.`);
        return;
      }

      if (!classObject.properties) {
        classObject.properties = [];
      }

      classObject.properties.push(property);
    });
  }

  private async extractClassInformation(): Promise<any[]> {
    return this.store.findSubjects(ns.rdf('type'), ns.owl('Class'))
      // .filter(x => isInScope(<RDF.NamedNode>x, this.store))
      .map(subjectId => {
        const assignedUri = this.store.getAssignedUri(subjectId);
        const parents = this.store.getParentsOfClass(subjectId);

        let label;
        let definition;
        let usageNote;
        if (this.configuration.specificationType === SpecificationType.ApplicationProfile) {
          label = this.store.getApLabel(subjectId, this.configuration.language) || this.store.getApLabel(subjectId) ||
            this.store.getVocLabel(subjectId, this.configuration.language) || this.store.getVocLabel(subjectId) || this.store.getDiagramLabel(subjectId);

          definition = this.store.getApDefinition(subjectId, this.configuration.language) || this.store.getApDefinition(subjectId) ||
            this.store.getVocDefinition(subjectId, this.configuration.language) || this.store.getVocDefinition(subjectId);

          usageNote = this.store.getApUsageNote(subjectId, this.configuration.language) || this.store.getApUsageNote(subjectId) ||
            this.store.getVocUsageNote(subjectId, this.configuration.language) || this.store.getVocUsageNote(subjectId);
        } else {
          label = this.store.getVocLabel(subjectId, this.configuration.language) || this.store.getVocLabel(subjectId) || this.store.getDiagramLabel(subjectId);
          definition = this.store.getVocDefinition(subjectId, this.configuration.language) || this.store.getVocDefinition(subjectId)
          usageNote = this.store.getVocUsageNote(subjectId, this.configuration.language) || this.store.getVocUsageNote(subjectId)
        }

        const parentAssignedUris: string[] = [];
        parents.forEach(parent => {
          let parentAssignedUri = this.store.getAssignedUri(parent);

          if (!parentAssignedUri) {
            this.logger.error(`Unable to find the assigned URI of parent (${parent.value}) of class ${subjectId.value}.`);
          } else {
            parentAssignedUris.push(parentAssignedUri.value);
          }
        });

        return {
          id: assignedUri?.value,
          label: label?.value,
          definition: definition?.value,
          usageNote: usageNote?.value,
          parents: parentAssignedUris,
        };
      })
      .sort(alphabeticalSort);
  }

  private async extractPropertyInformation(): Promise<any[]> {
    return [
      ...this.store.findSubjects(ns.rdf('type'), ns.owl('DatatypeProperty')),
      ...this.store.findSubjects(ns.rdf('type'), ns.owl('ObjectProperty')),
    ]
      .filter(x => isInScope(<RDF.NamedNode>x, this.store))
      .map(subjectId => {
        const assignedUri = this.store.getAssignedUri(subjectId);
        const minCount = this.store.getMinCardinality(subjectId);
        const maxCount = this.store.getMaxCardinality(subjectId);

        let label;
        let definition;
        let usageNote;
        if (this.configuration.specificationType === SpecificationType.ApplicationProfile) {
          label = this.store.getApLabel(subjectId, this.configuration.language) || this.store.getApLabel(subjectId) ||
            this.store.getVocLabel(subjectId, this.configuration.language) || this.store.getVocLabel(subjectId) || this.store.getDiagramLabel(subjectId);

          definition = this.store.getApDefinition(subjectId, this.configuration.language) || this.store.getApDefinition(subjectId) ||
            this.store.getVocDefinition(subjectId, this.configuration.language) || this.store.getVocDefinition(subjectId);

          usageNote = this.store.getApUsageNote(subjectId, this.configuration.language) || this.store.getApUsageNote(subjectId) ||
            this.store.getVocUsageNote(subjectId, this.configuration.language) || this.store.getVocUsageNote(subjectId);
        } else {
          label = this.store.getVocLabel(subjectId, this.configuration.language) || this.store.getVocLabel(subjectId) || this.store.getDiagramLabel(subjectId);
          definition = this.store.getVocDefinition(subjectId, this.configuration.language) || this.store.getVocDefinition(subjectId)
          usageNote = this.store.getVocUsageNote(subjectId, this.configuration.language) || this.store.getVocUsageNote(subjectId)
        }

        const domain = this.store.getDomain(subjectId);
        if (!domain) {
          throw new Error(`Unable to find the domain of subject ${subjectId.value}.`);
        }
        const domainAssignedUri = this.store.getAssignedUri(domain);

        const range = this.store.getRange(subjectId);
        if (!range) {
          throw new Error(`Unable to find the range for subject ${subjectId.value}.`);
        }

        let rangeAssignedUri = this.store.getAssignedUri(range);

        if (!rangeAssignedUri) {
          this.logger.error(`Unable to find the assigned URI of range (${range.value}) of attribute ${subjectId.value}.`);
        }

        return {
          id: assignedUri?.value,
          label: label?.value,
          definition: definition?.value,
          minCount: minCount?.value,
          maxCount: maxCount?.value,
          usageNote: usageNote?.value,
          domain: domainAssignedUri?.value,
          range: rangeAssignedUri?.value,
        };
      })
      .sort(alphabeticalSort);
  }
}
