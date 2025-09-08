import {
  ServiceIdentifier,
  type IService,
  type Logger,
  QuadStore,
  getApplicationProfileLabel,
  getVocabularyLabel,
  getVocabularyDefinition,
  getApplicationProfileDefinition,
  getVocabularyUsageNote,
  getApplicationProfileUsageNote,
  ns,
  getMinCount,
  getMaxCount,
  SpecificationType,
} from '@oslo-flanders/core';
import { inject, injectable } from 'inversify';
import { JsonWebuniversumGenerationServiceConfiguration } from './config/JsonWebuniversumGenerationServiceConfiguration';
import type * as RDF from '@rdfjs/types';
import { writeFile } from 'fs/promises';
import { WebuniversumObject } from './types/WebuniversumObject';
import { WebuniversumProperty } from './types/WebuniversumProperty';
import {
  filterWebuniversumObjects,
  isExternalUri,
  isInPackage,
  isScoped,
  sortWebuniversumObjects,
} from './utils/utils';
import { isStandardDatatype } from '@oslo-flanders/core';

@injectable()
export class JsonWebuniversumGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: JsonWebuniversumGenerationServiceConfiguration;
  public readonly store: QuadStore;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration)
    configuration: JsonWebuniversumGenerationServiceConfiguration,
    @inject(ServiceIdentifier.QuadStore) store: QuadStore,
  ) {
    this.logger = logger;
    this.configuration = configuration;
    this.store = store;
  }

  public async init(): Promise<void> {
    return this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    const classJobs = this.store
      .getClassIds()
      .map((classId) => this.generateEntityData(classId));

    const datatypeJobs = this.store
      .findSubjects(ns.rdf('type'), ns.rdfs('Datatype'))
      .map((datatypeId) => this.generateEntityData(<RDF.NamedNode>datatypeId));

    const classes: WebuniversumObject[] = await Promise.all(classJobs);
    const dataTypes: WebuniversumObject[] = await Promise.all(datatypeJobs);
    const properties = [...classes, ...dataTypes].flatMap((c) =>
      filterWebuniversumObjects(c.properties || [], []),
    );

    // Sort entities
    sortWebuniversumObjects(
      classes,
      this.configuration.specificationType,
      this.configuration.language,
    );
    classes.forEach((classObject: WebuniversumObject) =>
      sortWebuniversumObjects(
        classObject.properties || [],
        this.configuration.specificationType,
        this.configuration.language,
      ),
    );

    sortWebuniversumObjects(
      dataTypes,
      this.configuration.specificationType,
      this.configuration.language,
    );
    dataTypes.forEach((datatypeObject: WebuniversumObject) =>
      sortWebuniversumObjects(
        datatypeObject.properties || [],
        this.configuration.specificationType,
        this.configuration.language,
      ),
    );

    const baseURI = this.getBaseURI();
    let template: any = { baseURI };

    // Filter entitities
    if (this.configuration.applyFiltering) {
      const scopedDataTypes = filterWebuniversumObjects(dataTypes, [isScoped]);

      const inPackageProperties = [...classes, ...dataTypes].flatMap((c) =>
        filterWebuniversumObjects(c.properties || [], [isInPackage]),
      );

      template = {
        ...template,
        classes: sortWebuniversumObjects(
          this.getFilteredEntities(
            classes,
            dataTypes,
            this.configuration.language,
            this.configuration.specificationType,
          ),
          this.configuration.specificationType,
          this.configuration.language,
        ),
        // scoped data types
        dataTypes: sortWebuniversumObjects(
          scopedDataTypes,
          this.configuration.specificationType,
          this.configuration.language,
        ),
        // Only the in package properties will be shown
        properties: sortWebuniversumObjects(
          inPackageProperties,
          this.configuration.specificationType,
          this.configuration.language,
        ),
      };
    } else {
      template = {
        ...template,
        classes: sortWebuniversumObjects(
          classes,
          this.configuration.specificationType,
          this.configuration.language,
        ),
        dataTypes: sortWebuniversumObjects(
          dataTypes,
          this.configuration.specificationType,
          this.configuration.language,
        ),
        properties: sortWebuniversumObjects(
          properties,
          this.configuration.specificationType,
          this.configuration.language,
        ),
      };
    }

    await writeFile(
      this.configuration.output,
      JSON.stringify(template, null, 2),
      'utf-8',
    );
  }

  // Check to see if the range linked to the property is listed in the document's classes and datatypes
  private filterRangeExists(range: RDF.Term): boolean {
    const assignedUri = this.store.getAssignedUri(range);

    if (!assignedUri) {
      return false;
    }

    // If the assigned URI is a standard datatype, return false
    // This is to avoid showing standard datatypes like xsd:string, xsd:date, etc.
    if (isStandardDatatype(assignedUri.value)) {
      return false;
    }

    // Check if the range exists in the document's classes and datatypes
    const parentRange: RDF.Term | undefined = [
      ...this.store.getClassIds(),
      ...this.store.getDatatypes(),
    ]
      .filter((classId) => classId.equals(range))
      .find((classId) => this.store.getAssignedUri(classId)?.value);

    return !!parentRange;
  }
  // AP needs to show all classes (no scope filtering)
  // In package classes and in publication Environment classes
  // Introduce a new parameter similar to html-generation-service
  // At the same time the VOC classes need to show both the classes in the package as well as Datatypes in the package
  private getFilteredEntities(
    classes: WebuniversumObject[],
    dataTypes: WebuniversumObject[],
    language: string,
    specificationType: SpecificationType,
  ): WebuniversumObject[] {
    // In an application profile, we have a separate list of classes and datatypes. There is no need to merge them, whereas in a vocabulary, we need to merge them.
    if (specificationType === SpecificationType.ApplicationProfile) {
      return sortWebuniversumObjects(
        classes,
        this.configuration.specificationType,
        language,
      );
    }
    // Filter the classes to just the ones that are in the package
    // If we're dealing with a vocabulary, showcase both classes and datatypes
    const inPackageClasses = filterWebuniversumObjects(classes, [isInPackage]);
    const inPackageDatatypes = filterWebuniversumObjects(dataTypes, [
      isInPackage,
    ]);
    return sortWebuniversumObjects(
      [...inPackageClasses, ...inPackageDatatypes],
      this.configuration.specificationType,
      language,
    );
  }

  private getBaseURI(): string {
    const packageSubject: RDF.Term = <RDF.Term>(
      this.store.findQuad(null, ns.rdf('type'), ns.oslo('Package'))?.subject
    );

    if (!packageSubject) {
      throw new Error(`Unable to find the subject for the package.`);
    }

    const baseURIObject: RDF.Literal | undefined = <RDF.Literal | undefined>(
      this.store.findObject(packageSubject, ns.oslo('baseURI'))
    );

    if (!baseURIObject) {
      throw new Error(`Unable to find the baseURI for the package.`);
    }

    return baseURIObject.value;
  }

  private async generateEntityData(
    entity: RDF.NamedNode,
    includeProperties: boolean = true,
  ): Promise<WebuniversumObject> {
    const assignedURI: RDF.NamedNode | undefined =
      this.store.getAssignedUri(entity);
    if (!assignedURI) {
      throw new Error(
        `Unable to find the assigned URI for entity ${entity.value}.`,
      );
    }

    const fetchProperty = (
      fetchFunction: (
        subjectId: RDF.NamedNode,
        store: QuadStore,
        language: string,
      ) => RDF.Literal | undefined,
      subject: RDF.NamedNode,
    ) => fetchFunction(subject, this.store, this.configuration.language)?.value;

    const vocabularyLabel: string | undefined = fetchProperty(
      getVocabularyLabel,
      entity,
    );
    const applicationProfileLabel: string | undefined = fetchProperty(
      getApplicationProfileLabel,
      entity,
    );
    const vocabularyDefinition: string | undefined = fetchProperty(
      getVocabularyDefinition,
      entity,
    );
    const applicationProfileDefinition: string | undefined = fetchProperty(
      getApplicationProfileDefinition,
      entity,
    );
    const vocabularyUsageNote: string | undefined = fetchProperty(
      getVocabularyUsageNote,
      entity,
    );
    const applicationProfileUsageNote: string | undefined = fetchProperty(
      getApplicationProfileUsageNote,
      entity,
    );

    const parentsIds: RDF.NamedNode[] = includeProperties
      ? this.store.getParentsOfClass(entity)
      : this.store.getParentOfProperty(entity) !== undefined
        ? [this.store.getParentOfProperty(entity)!]
        : [];
    const parentObjects: Pick<
      WebuniversumObject,
      'id' | 'vocabularyLabel' | 'applicationProfileLabel'
    >[] = parentsIds.map((parentId) => this.createParentObject(parentId));

    const scope: string | undefined = this.store.getScope(entity)?.value;

    const status: string | undefined = this.store.getStatus(entity)?.value;

    const entityData: WebuniversumObject = {
      id: assignedURI.value,
      ...(vocabularyLabel && {
        vocabularyLabel: { [this.configuration.language]: vocabularyLabel },
      }),
      ...(applicationProfileLabel && {
        applicationProfileLabel: {
          [this.configuration.language]: applicationProfileLabel,
        },
      }),
      ...(vocabularyDefinition && {
        vocabularyDefinition: {
          [this.configuration.language]: vocabularyDefinition,
        },
      }),
      ...(applicationProfileDefinition && {
        applicationProfileDefinition: {
          [this.configuration.language]: applicationProfileDefinition,
        },
      }),
      ...(vocabularyUsageNote && {
        vocabularyUsageNote: {
          [this.configuration.language]: vocabularyUsageNote,
        },
      }),
      ...(applicationProfileUsageNote && {
        applicationProfileUsageNote: {
          [this.configuration.language]: applicationProfileUsageNote,
        },
      }),
      ...(parentObjects.length > 0 && {
        parents: sortWebuniversumObjects(
          parentObjects,
          this.configuration.specificationType,
          this.configuration.language,
        ),
      }),
      ...(scope && {
        scope: scope,
      }),
      ...(status && {
        status: status,
      }),
    };

    if (this.configuration.allTags) {
      const extensions = this.getExtensionsForEntity(entity);
      // Add this line to actually apply the extensions:
      Object.assign(entityData, extensions);
    }

    if (includeProperties) {
      const jobs: Promise<WebuniversumProperty>[] = this.store
        .findSubjects(ns.rdfs('domain'), entity)
        .map<Promise<WebuniversumProperty>>(async (property: RDF.Term) => {
          return <Promise<WebuniversumProperty>>(
            this.generateEntityData(<RDF.NamedNode>property, true).then(
              (propertyObject) =>
                this.addPropertySpecificInformation(
                  <RDF.NamedNode>property,
                  <WebuniversumProperty>propertyObject,
                  entity,
                ),
            )
          );
        });

      const properties: WebuniversumProperty[] = await Promise.all(jobs);

      if (this.configuration.inheritance) {
        // Get inherited properties from parent classes
        const inheritedProperties: WebuniversumProperty[] =
          await this.getInheritedProperties(entity);
        properties.push(...inheritedProperties);
      }

      if (properties.length) {
        entityData.properties = properties;
      }
    }

    return entityData;
  }

  private getPropertiesOfClass(
    classSubject: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.Term[] {
    return <RDF.Term[]>(
      this.store.findSubjects(ns.rdfs('domain'), classSubject, graph)
    );
  }

  private getExtensionsForEntity(entity: RDF.NamedNode): Record<string, any> {
    const extensionProperties: Record<string, any> = {};

    // Get extensions from the QuadStore
    const extensionQuads = this.store.getExtensionTags(entity);

    extensionQuads.forEach((quad) => {
      try {
        const key = this.store.getOsloExtensionKey(quad.object)?.value;
        if (!key) {
          this.logger.warn(
            `No key found for extension on entity ${entity.value}. Skipping this extension.`,
          );
          return;
        }
        const value = this.store.getOsloExtensionValue(quad.object)?.value;
        if (!value) {
          this.logger.warn(
            `No value found for extension with key ${key} on entity ${entity.value}. Skipping this extension.`,
          );
          return;
        }
        extensionProperties[key] = {
          [this.configuration.language]: value,
        };

        // Convert both single objects and arrays to a uniform array format
      } catch (error) {
        this.logger.warn(
          `Failed to parse extensions for entity ${entity.value}: ${error}`,
        );
      }
    });

    return extensionProperties;
  }

  private async getInheritedProperties(
    classSubject: RDF.NamedNode,
  ): Promise<WebuniversumProperty[]> {
    const inheritedProperties: WebuniversumProperty[] = [];
    const parents = this.store.getParentsOfClass(classSubject);

    for (const parent of parents) {
      // Get properties of parent class
      const parentProperties = this.getPropertiesOfClass(parent);

      // Convert each parent property to WebuniversumProperty
      for (const propertySubject of parentProperties) {
        try {
          const propertyData = await this.generateEntityData(
            <RDF.NamedNode>propertySubject,
            false,
          );

          const webuniversumProperty = this.addPropertySpecificInformation(
            <RDF.NamedNode>propertySubject,
            <WebuniversumProperty>propertyData,
            parent,
          );

          inheritedProperties.push(webuniversumProperty);
        } catch (error) {
          this.logger.warn(
            `Failed to process inherited property ${propertySubject.value} from parent ${parent.value}: ${error}`,
          );
        }
      }

      // Recursively get properties from parent's parents
      const parentInheritedProperties =
        await this.getInheritedProperties(parent);
      inheritedProperties.push(...parentInheritedProperties);
    }

    return inheritedProperties;
  }

  private addPropertySpecificInformation(
    subject: RDF.NamedNode,
    propertyObject: WebuniversumProperty,
    domainId: RDF.NamedNode,
  ): WebuniversumProperty {
    const domainAssignedURI: string | undefined =
      this.store.getAssignedUri(domainId)?.value;

    if (domainAssignedURI) {
      propertyObject.domain = domainAssignedURI;
    }

    const range: RDF.NamedNode | undefined = this.store.getRange(subject);
    if (!range) {
      throw new Error(`No range found for class ${subject.value}.`);
    }

    const rangeAssignedURI: RDF.NamedNode | undefined =
      this.store.getAssignedUri(range);
    if (!rangeAssignedURI) {
      throw new Error(
        `Unable to find the assigned URI for range ${range.value} of attribute ${subject.value}.`,
      );
    }

    propertyObject.range = {
      id: rangeAssignedURI.value,
      listedInDocument: this.filterRangeExists(range),
    };

    const rangeVocabularyLabel: RDF.Literal | undefined = getVocabularyLabel(
      range,
      this.store,
      this.configuration.language,
    );
    const rangeApplicationProfileLabel: RDF.Literal | undefined =
      getApplicationProfileLabel(
        range,
        this.store,
        this.configuration.language,
      );
    rangeVocabularyLabel &&
      (propertyObject.range.vocabularyLabel = {
        [this.configuration.language]: rangeVocabularyLabel.value,
      });
    rangeApplicationProfileLabel &&
      (propertyObject.range.applicationProfileLabel = {
        [this.configuration.language]: rangeApplicationProfileLabel.value,
      });

    getMinCount(subject, this.store) &&
      (propertyObject.minCount = getMinCount(subject, this.store));
    getMaxCount(subject, this.store) &&
      (propertyObject.maxCount = getMaxCount(subject, this.store));

    let codelist = this.store.getCodelist(subject);
    if (!codelist && rangeAssignedURI.equals(ns.skos('Concept'))) {
      codelist = this.store.getCodelist(range);
    }

    if (codelist) {
      propertyObject.codelist = codelist.value;
    }

    return propertyObject;
  }

  private createParentObject(
    subject: RDF.NamedNode,
  ): Pick<
    WebuniversumObject,
    'id' | 'vocabularyLabel' | 'applicationProfileLabel'
  > {
    const parentAssignedURI: RDF.NamedNode | undefined =
      this.store.getAssignedUri(subject);

    if (!parentAssignedURI) {
      // Check if this is an external URI (doesn't start with "urn:")
      if (isExternalUri(subject.value)) {
        this.logger.warn(
          `Unable to find the assigned URI for external class ${subject.value} which acts as a parent. Using original URI as fallback.`,
        );

        // Return a minimal object with just the ID to allow the process to continue
        return {
          id: subject.value,
        };
      } else {
        // For internal URIs, throw an error since they should be resolvable
        throw new Error(
          `Unable to find the assigned URI for internal class ${subject.value} which acts as a parent.`,
        );
      }
    }

    const parentVocabularyLabel: RDF.Literal | undefined = getVocabularyLabel(
      subject,
      this.store,
      this.configuration.language,
    );
    const parentApplicationProfileLabel: RDF.Literal | undefined =
      getApplicationProfileLabel(
        subject,
        this.store,
        this.configuration.language,
      );

    return {
      id: parentAssignedURI.value,
      ...(parentVocabularyLabel && {
        vocabularyLabel: {
          [this.configuration.language]: parentVocabularyLabel.value,
        },
      }),
      ...(parentApplicationProfileLabel && {
        applicationProfileLabel: {
          [this.configuration.language]: parentApplicationProfileLabel.value,
        },
      }),
    };
  }
}
