/* eslint-disable eslint-comments/disable-enable-pair */

import { writeFile } from 'fs/promises';
import type { IService } from '@oslo-flanders/core';
import {
  Logger,
  ns,
  ServiceIdentifier,
  QuadStore,
  getApplicationProfileLabel,
} from '@oslo-flanders/core';

import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import { JsonldContextGenerationServiceConfiguration } from './config/JsonldContextGenerationServiceConfiguration';
import { toCamelCase, toPascalCase } from './utils/utils';
import { ClassMetadata } from './types/ClassMetadata';
import { PropertyMetadata } from './types/PropertyMetadata';

@injectable()
export class JsonldContextGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: JsonldContextGenerationServiceConfiguration;
  public readonly store: QuadStore;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration)
    config: JsonldContextGenerationServiceConfiguration,
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

  /**
   * Generates a JSON-LD context object
   * @returns an context object
   */
  private async generateContext(): Promise<any> {
    const [classMetadata, datatypeMetadata, propertyMetadata] =
      await Promise.all([
        this.createClassMetadata(),
        this.createDatatypeMetadata(),
        this.createPropertyMetadata(),
      ]);

    // Combine class and datatype metadata
    const allTypeMetadata = [...classMetadata, ...datatypeMetadata];

    return this.configuration.scopedContext
      ? this.createScopedContext(allTypeMetadata, propertyMetadata)
      : this.createRegularContext(allTypeMetadata, propertyMetadata);
  }

  /**
   * Identifies labels that have been used two or more times for a different URI
   * @param uris — RDF.NamedNode validate their label is unique
   * @returns an array of RDF.NamedNode that have a label that is not unique
   */
  private identifyDuplicateLabels(uris: RDF.NamedNode[]): RDF.NamedNode[] {
    const labelUriMap: Map<string, RDF.NamedNode[]> = new Map();

    uris.forEach((uri) => {
      const label: RDF.Literal | undefined = getApplicationProfileLabel(
        uri,
        this.store,
        this.configuration.language,
      );

      if (!label) {
        return;
      }

      const labelUris = labelUriMap.get(label.value) || [];
      labelUris.push(uri);
      labelUriMap.set(label.value, labelUris);
    });

    const duplicates: RDF.NamedNode[] = [];
    labelUriMap.forEach((subjects: RDF.NamedNode[]) => {
      const uniqueUris: Set<string> = new Set();
      const uniqueSubjects: RDF.NamedNode[] = [];

      // Check if the label is used multiple times for different URIs and add them to the duplicates array
      // if the URI is the same for all subjects, only add the first one
      subjects.forEach((subject) => {
        const assignedUri = this.store.getAssignedUri(subject);
        if (assignedUri && !uniqueUris.has(assignedUri.value)) {
          uniqueUris.add(assignedUri.value);
          uniqueSubjects.push(subject);
        }
      });

      if (uniqueSubjects.length > 1) {
        duplicates.push(...uniqueSubjects);
      }
    });

    return duplicates;
  }

  /**
   * Creates a scoped context object
   * @param classMetadata An array of ClassMetadata objects
   * @param propertyMetadata An array of PropertyMetadata objects
   * @returns A scoped context object
   */
  private createScopedContext(
    classMetadata: ClassMetadata[],
    propertyMetadata: PropertyMetadata[],
  ): any {
    const result = classMetadata
      .sort((a, b) => a.label.value.localeCompare(b.label.value))
      .reduce((main, x: ClassMetadata) => {
        return {
          ...main,
          [toPascalCase(x.label.value)]: {
            '@id': x.assignedURI.value,
            '@context': {
              ...propertyMetadata
                .filter(
                  (y: PropertyMetadata) =>
                    y.domainLabel.value === x.label.value,
                )
                .sort((a, b) => a.label.value.localeCompare(b.label.value))
                .reduce((subMain, y: PropertyMetadata) => {
                  return {
                    ...subMain,
                    [toCamelCase(y.label.value)]: {
                      '@id': y.assignedURI.value,
                      ...(y.rangeAssignedUri && {
                        '@type': y.rangeAssignedUri.value,
                      }),
                      ...(y.addContainer === true && { '@container': '@set' }),
                    },
                  };
                }, {}),
            },
          },
        };
      }, {});

    // Delete empty @context objects
    for (const [key, value] of Object.entries(result)) {
      if (
        typeof value === 'object' &&
        Object.keys((<any>value)['@context']).length === 0
      ) {
        delete (<any>result)[key]['@context'];
      }
    }

    return result;
  }

  /**
   * Creates a regular context object
   * @param classMetadata An array of ClassMetadata objects
   * @param propertyMetadata An array of PropertyMetadata objects
   * @returns A regular context object
   */
  private createRegularContext(
    classMetadata: ClassMetadata[],
    propertyMetadata: PropertyMetadata[],
  ): any {
    const classContext = Object.fromEntries(
      classMetadata
        .sort((a, b) => a.label.value.localeCompare(b.label.value))
        .map((x: ClassMetadata) => [
          toPascalCase(x.label.value),
          x.assignedURI.value,
        ]),
    );

    const propertyContext = propertyMetadata.reduce(
      (main, x: PropertyMetadata) => {
        return {
          ...main,
          [x.addPrefix
            ? `${toPascalCase(x.domainLabel.value)}.${toCamelCase(x.label.value)}`
            : toCamelCase(x.label.value)]: {
            '@id': x.assignedURI.value,
            ...(x.rangeAssignedUri && { '@type': x.rangeAssignedUri.value }),
            ...(x.addContainer === true && { '@container': '@set' }),
          },
        };
      },
      {},
    );

    return Object.fromEntries(
      Object.entries({ ...classContext, ...propertyContext }).sort((a, b) =>
        a[0].localeCompare(b[0]),
      ),
    );
  }

  /**
   * Creates an array of ClassMetadata objects for datatypes
   * @returns An array of ClassMetadata objects for datatypes
   */
  private createDatatypeMetadata(): ClassMetadata[] {
    const datatypeMetadata: ClassMetadata[] = [];
    const datatypeSubjects: RDF.NamedNode[] = this.store.getDatatypes();
    const duplicates = this.identifyDuplicateLabels(datatypeSubjects);

    datatypeSubjects.forEach((subject) => {
      try {
        const label: RDF.Literal | undefined = getApplicationProfileLabel(
          subject,
          this.store,
          this.configuration.language,
        );
        if (!label) {
          throw new Error(
            `No label found for datatype ${subject.value} in language ${this.configuration.language}.`,
          );
        }

        if (duplicates.includes(subject)) {
          throw new Error(
            `Found ${subject.value} in duplicates, meaning "${label.value}" is used multiple times as label.`,
          );
        }

        const assignedUri: RDF.NamedNode | undefined =
          this.store.getAssignedUri(subject);

        if (!assignedUri) {
          throw new Error(
            `Unable to find the assigned URI for datatype ${subject.value}.`,
          );
        }

        datatypeMetadata.push({
          osloId: subject,
          assignedURI: assignedUri,
          label: label,
        });
      } catch (error) {
        this.logger.error((<Error>error).message);
      }
    });

    return datatypeMetadata;
  }

  /**
   * Creates an array of ClassMetadata objects
   * @returns An array of ClassMetadata objects
   */
  private createClassMetadata(): ClassMetadata[] {
    const classMetadata: ClassMetadata[] = [];
    const classSubjects: RDF.NamedNode[] = this.store.getClassIds();
    const duplicates = this.identifyDuplicateLabels(classSubjects);

    classSubjects.forEach((subject) => {
      try {
        const label: RDF.Literal | undefined = getApplicationProfileLabel(
          subject,
          this.store,
          this.configuration.language,
        );
        if (!label) {
          throw new Error(
            `No label found for class ${subject.value} in language ${this.configuration.language}.`,
          );
        }

        if (duplicates.includes(subject)) {
          throw new Error(
            `Found ${subject.value} in duplicates, meaning "${label.value}" is used multiple times as label.`,
          );
        }

        const assignedUri: RDF.NamedNode | undefined =
          this.store.getAssignedUri(subject);

        if (!assignedUri) {
          throw new Error(
            `Unable to find the assigned URI for class ${subject.value}.`,
          );
        }

        classMetadata.push({
          osloId: subject,
          assignedURI: assignedUri,
          label: label,
        });
      } catch (error) {
        this.logger.error((<Error>error).message);
      }
    });

    return classMetadata;
  }

  /**
   * Creates an array of PropertyMetadata objects
   * @returns An array of PropertyMetadata objects
   */
  private createPropertyMetadata(): PropertyMetadata[] {
    const propertyMetadata: PropertyMetadata[] = [];
    const datatypePropertySubjects = this.store.getDatatypePropertyIds();
    const objectPropertySubjects = this.store.getObjectPropertyIds();

    const duplicates = this.identifyDuplicateLabels([
      ...datatypePropertySubjects,
      ...objectPropertySubjects,
    ]);
    [...datatypePropertySubjects, ...objectPropertySubjects].forEach(
      (subject) => {
        try {
          const assignedUri: RDF.NamedNode | undefined =
            this.store.getAssignedUri(subject);

          if (!assignedUri) {
            throw new Error(
              `Unable to find the assigned URI for attribute ${subject.value}.`,
            );
          }

          const label: RDF.Literal | undefined = getApplicationProfileLabel(
            subject,
            this.store,
            this.configuration.language,
          );
          if (!label) {
            throw new Error(
              `No label found for attribute ${subject.value} in language "${this.configuration.language}" or without language tag.`,
            );
          }

          const range: RDF.NamedNode | undefined = this.store.getRange(subject);
          if (!range) {
            throw new Error(`No range found for attribute ${subject.value}.`);
          }
          const rangeUri: RDF.NamedNode | undefined =
            this.store.getAssignedUri(range);

          if (!rangeUri) {
            throw new Error(
              `Unable to find the assigned URI of range with id ${range.value}.`,
            );
          }

          const domain: RDF.NamedNode | undefined =
            this.store.getDomain(subject);
          if (!domain) {
            throw new Error(`No domain found for attribute ${subject.value}.`);
          }

          const domainLabel: RDF.Literal | undefined =
            getApplicationProfileLabel(
              domain,
              this.store,
              this.configuration.language,
            );

          if (!domainLabel) {
            throw new Error(
              `No label found for domain ${domain.value} of attribute ${subject.value}.`,
            );
          }

          propertyMetadata.push({
            osloId: subject,
            assignedURI: assignedUri,
            label: label,
            domainLabel: domainLabel,
            rangeAssignedUri: rangeUri,
            addContainer: this.canHaveAListOfValues(subject),
            addPrefix:
              this.configuration.addDomainPrefix ||
              duplicates.includes(subject),
          });
        } catch (error) {
          this.logger.error((<Error>error).message);
        }
      },
    );

    return propertyMetadata;
  }

  /**
   * Checks if a property can have multiple values
   * @param subject — The Quad_Subject to check the cardinality of
   * @param store — The triple store to fetch triples about the Quad_Subject
   * @returns — A boolean indicating whether or not to add the "@container" property to the attribute
   */
  private canHaveAListOfValues(subject: RDF.Quad_Subject): boolean {
    const maxCount: RDF.Literal | undefined =
      this.store.getMaxCardinality(subject);

    if (!maxCount) {
      this.logger.warn(
        `Unable to retrieve max cardinality of property ${subject.value}.`,
      );
      return false;
    }

    return maxCount.value === '*';
  }
}
