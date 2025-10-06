import { writeFile, mkdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import type { IService } from '@oslo-flanders/core';
import {
  ns,
  Logger,
  QuadStore,
  ServiceIdentifier,
  getApplicationProfileLabel,
  getVocabularyLabel,
  getApplicationProfileDefinition,
  getVocabularyDefinition,
  getApplicationProfileUsageNote,
  getVocabularyUsageNote,
  SpecificationType,
} from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import * as nj from 'nunjucks';
import { HtmlRespecGenerationServiceConfiguration } from './config/HtmlRespecGenerationServiceConfiguration';
import { alphabeticalSort } from './utils/alphabeticalSort';
import { isInScope } from './utils/scopeFilter';

@injectable()
export class HtmlRespecGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: HtmlRespecGenerationServiceConfiguration;
  public readonly store: QuadStore;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration)
    config: HtmlRespecGenerationServiceConfiguration,
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

    const indexPath =
      this.configuration.specificationType === SpecificationType.Vocabulary
        ? 'vocabulary/index.njk'
        : 'application-profile/index.njk';

    let data: any = {};
    if (
      this.configuration.specificationType ===
      SpecificationType.ApplicationProfile
    ) {
      this.groupPropertiesPerDomain(classes, attributes);
      data = classes;
    } else {
      data.classes = classes;
      data.properties = attributes;
    }

    const html = nj.render(indexPath, {
      specName: this.configuration.specificationName,
      shortName: this.configuration.specificationName,
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
    properties.forEach((property) => {
      const classObject = classes.find((x) => x.id === property.domain);

      if (!classObject) {
        this.logger.error(
          `Unable to find a related class object for domain ${property.domain} of property ${property.id}.`,
        );
        return;
      }

      if (!classObject.properties) {
        classObject.properties = [];
      }

      classObject.properties.push(property);
    });
  }

  private async extractClassInformation(): Promise<any[]> {
    const classJobs = this.store.getClassIds();

    const datatypeJobs = this.store.findSubjects(
      ns.rdf('type'),
      ns.rdfs('Datatype'),
    );

    const classes: RDF.Term[] = await Promise.all(classJobs);
    const dataTypes: RDF.Term[] = await Promise.all(datatypeJobs);
    const entities = [...classes, ...dataTypes];
    const uniqueEntities = Array.from(
      new Map(entities.map((entity) => [entity.value, entity])).values(),
    );
    return (
      uniqueEntities
        // .filter(x => isInScope(<RDF.NamedNode>x, this.store))
        .map((subjectId) => {
          const assignedUri = this.store.getAssignedUri(subjectId);
          const parents = this.store.getParentsOfClass(subjectId);

          const label =
            this.configuration.specificationType ===
            SpecificationType.ApplicationProfile
              ? getApplicationProfileLabel(
                  subjectId,
                  this.store,
                  this.configuration.language,
                )
              : getVocabularyLabel(
                  subjectId,
                  this.store,
                  this.configuration.language,
                );

          const definition =
            this.configuration.specificationType ===
            SpecificationType.ApplicationProfile
              ? getApplicationProfileDefinition(
                  subjectId,
                  this.store,
                  this.configuration.language,
                )
              : getVocabularyDefinition(
                  subjectId,
                  this.store,
                  this.configuration.language,
                );

          const usageNote =
            this.configuration.specificationType ===
            SpecificationType.ApplicationProfile
              ? getApplicationProfileUsageNote(
                  subjectId,
                  this.store,
                  this.configuration.language,
                )
              : getVocabularyUsageNote(
                  subjectId,
                  this.store,
                  this.configuration.language,
                );

          const parentAssignedUris: string[] = [];
          parents.forEach((parent) => {
            let parentAssignedUri = this.store.getAssignedUri(parent);

            if (!parentAssignedUri) {
              this.logger.error(
                `Unable to find the assigned URI of parent (${parent.value}) of class ${subjectId.value}.`,
              );
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
        .sort(alphabeticalSort)
    );
  }

  private async extractPropertyInformation(): Promise<any[]> {
    return [
      ...this.store.findSubjects(ns.rdf('type'), ns.owl('DatatypeProperty')),
      ...this.store.findSubjects(ns.rdf('type'), ns.owl('ObjectProperty')),
    ]
      .filter((x) => isInScope(<RDF.NamedNode>x, this.store))
      .map((subjectId) => {
        const assignedUri = this.store.getAssignedUri(subjectId);
        const minCount = this.store.getMinCardinality(subjectId);
        const maxCount = this.store.getMaxCardinality(subjectId);

        const label =
          this.configuration.specificationType ===
          SpecificationType.ApplicationProfile
            ? getApplicationProfileLabel(
                subjectId,
                this.store,
                this.configuration.language,
              )
            : getVocabularyLabel(
                subjectId,
                this.store,
                this.configuration.language,
              );

        const definition =
          this.configuration.specificationType ===
          SpecificationType.ApplicationProfile
            ? getApplicationProfileDefinition(
                subjectId,
                this.store,
                this.configuration.language,
              )
            : getVocabularyDefinition(
                subjectId,
                this.store,
                this.configuration.language,
              );

        const usageNote =
          this.configuration.specificationType ===
          SpecificationType.ApplicationProfile
            ? getApplicationProfileUsageNote(
                subjectId,
                this.store,
                this.configuration.language,
              )
            : getVocabularyUsageNote(
                subjectId,
                this.store,
                this.configuration.language,
              );

        const domain = this.store.getDomain(subjectId);
        if (!domain) {
          throw new Error(
            `Unable to find the domain of subject ${subjectId.value}.`,
          );
        }
        const domainAssignedUri = this.store.getAssignedUri(domain);

        const range = this.store.getRange(subjectId);
        if (!range) {
          throw new Error(
            `Unable to find the range for subject ${subjectId.value}.`,
          );
        }

        let rangeAssignedUri = this.store.getAssignedUri(range);

        if (!rangeAssignedUri) {
          this.logger.error(
            `Unable to find the assigned URI of range (${range.value}) of attribute ${subjectId.value}.`,
          );
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
