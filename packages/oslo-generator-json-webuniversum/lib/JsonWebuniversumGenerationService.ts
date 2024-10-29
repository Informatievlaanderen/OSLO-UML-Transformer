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
} from '@oslo-flanders/core';
import { inject, injectable } from 'inversify';
import { JsonWebuniversumGenerationServiceConfiguration } from './config/JsonWebuniversumGenerationServiceConfiguration';
import type * as RDF from '@rdfjs/types';
import { writeFile } from 'fs/promises';
import { WebuniversumObject } from './types/WebuniversumObject';
import { WebuniversumProperty } from './types/WebuniversumProperty';
import {
  filterWebuniversumObjects,
  isInPackage,
  isExternal,
  isInPublicationEnvironment,
  isScoped,
  sortWebuniversumObjects,
  isInPublication,
} from './utils/utils';

@injectable()
export class JsonWebuniversumGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: JsonWebuniversumGenerationServiceConfiguration;
  public readonly store: QuadStore;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration)
    configuration: JsonWebuniversumGenerationServiceConfiguration,
    @inject(ServiceIdentifier.QuadStore) store: QuadStore
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
      filterWebuniversumObjects(c.properties || [], [])
    );

    // Sort entities
    sortWebuniversumObjects(classes, this.configuration.language);
    classes.forEach((classObject: WebuniversumObject) =>
      sortWebuniversumObjects(
        classObject.properties || [],
        this.configuration.language
      )
    );

    sortWebuniversumObjects(dataTypes, this.configuration.language);
    dataTypes.forEach((datatypeObject: WebuniversumObject) =>
      sortWebuniversumObjects(
        datatypeObject.properties || [],
        this.configuration.language
      )
    );

    const baseURI = this.getBaseURI();
    let template: any = { baseURI };

    // Filter entitities
    if (this.configuration.applyFiltering) {
      const inPackageClasses = filterWebuniversumObjects(classes, [
        isInPackage,
      ]);
      const inPublicationEnvironmentClasses = filterWebuniversumObjects(
        classes,
        [isInPublicationEnvironment]
      );

      const inPackageDataTypes = filterWebuniversumObjects(dataTypes, [
        isInPackage,
      ]);
      const scopedDataTypes = filterWebuniversumObjects(dataTypes, [isScoped]);

      const externalProperties = [...classes, ...dataTypes].flatMap((c) =>
        filterWebuniversumObjects(c.properties || [], [
          isExternal,
          () => !isInPublication(c, this.configuration.publicationEnvironment),
        ])
      );

      const inPackageProperties = [...classes, ...dataTypes].flatMap((c) =>
        filterWebuniversumObjects(c.properties || [], [isInPackage])
      );

      template = {
        ...template,
        entities: sortWebuniversumObjects(
          [...inPackageClasses, ...inPublicationEnvironmentClasses],
          this.configuration.language
        ),
        inPackageClasses: sortWebuniversumObjects(
          inPackageClasses,
          this.configuration.language
        ),
        // In package data types
        inPackageDataTypes: sortWebuniversumObjects(
          inPackageDataTypes,
          this.configuration.language
        ),
        // scoped data types
        dataTypes: sortWebuniversumObjects(
          scopedDataTypes,
          this.configuration.language
        ),
        externalProperties: sortWebuniversumObjects(
          externalProperties,
          this.configuration.language
        ),

        // Only the in package properties will be shown
        properties: sortWebuniversumObjects(
          inPackageProperties,
          this.configuration.language
        ),
        // In package classes and in package data types are merged
        classes: sortWebuniversumObjects(
          [...inPackageDataTypes, ...inPackageClasses],
          this.configuration.language
        ),
      };
    } else {
      template = {
        ...template,
        entities: classes,
        classes,
        dataTypes,
        properties,
      };
    }

    await writeFile(
      this.configuration.output,
      JSON.stringify(template, null, 2),
      'utf-8'
    );
  }

  private filterByRangeListedInDocument(
    rangeAssignedURI: string
  ): string | undefined {
    const inPackageUri: string | undefined = [
      ...this.store.getClassIds(),
      ...this.store.getDatatypes(),
    ]
      .map((classId) => this.store.getAssignedUri(classId)?.value)
      .find(
        (value) =>
          value === rangeAssignedURI && value.startsWith(this.getBaseURI())
      );

    return inPackageUri;
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
    includeProperties: boolean = true
  ): Promise<WebuniversumObject> {
    const assignedURI: RDF.NamedNode | undefined =
      this.store.getAssignedUri(entity);
    if (!assignedURI) {
      throw new Error(
        `Unable to find the assigned URI for entity ${entity.value}.`
      );
    }

    const fetchProperty = (
      fetchFunction: (
        subjectId: RDF.NamedNode,
        store: QuadStore,
        language: string
      ) => RDF.Literal | undefined,
      subject: RDF.NamedNode
    ) => fetchFunction(subject, this.store, this.configuration.language)?.value;

    const vocabularyLabel: string | undefined = fetchProperty(
      getVocabularyLabel,
      entity
    );
    const applicationProfileLabel: string | undefined = fetchProperty(
      getApplicationProfileLabel,
      entity
    );
    const vocabularyDefinition: string | undefined = fetchProperty(
      getVocabularyDefinition,
      entity
    );
    const applicationProfileDefinition: string | undefined = fetchProperty(
      getApplicationProfileDefinition,
      entity
    );
    const vocabularyUsageNote: string | undefined = fetchProperty(
      getVocabularyUsageNote,
      entity
    );
    const applicationProfileUsageNote: string | undefined = fetchProperty(
      getApplicationProfileUsageNote,
      entity
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
        parents: parentObjects,
      }),
      ...(scope && {
        scope: scope,
      }),
      ...(status && {
        status: status,
      }),
    };

    if (includeProperties) {
      const jobs: Promise<WebuniversumProperty>[] = this.store
        .findSubjects(ns.rdfs('domain'), entity)
        .map<Promise<WebuniversumProperty>>(async (property: RDF.Term) => {
          return <Promise<WebuniversumProperty>>(
            this.generateEntityData(<RDF.NamedNode>property, false).then(
              (propertyObject) =>
                this.addPropertySpecificInformation(
                  <RDF.NamedNode>property,
                  <WebuniversumProperty>propertyObject,
                  assignedURI
                )
            )
          );
        });

      const properties: WebuniversumProperty[] = await Promise.all(jobs);

      if (properties.length) {
        entityData.properties = properties;
      }
    }

    return entityData;
  }

  private addPropertySpecificInformation(
    subject: RDF.NamedNode,
    propertyObject: WebuniversumProperty,
    domainId: RDF.NamedNode
  ): WebuniversumProperty {
    propertyObject.domain = domainId.value;

    const range: RDF.NamedNode | undefined = this.store.getRange(subject);
    if (!range) {
      throw new Error(`No range found for class ${subject.value}.`);
    }

    const rangeAssignedURI: RDF.NamedNode | undefined =
      this.store.getAssignedUri(range);
    if (!rangeAssignedURI) {
      throw new Error(
        `Unable to find the assigned URI for range ${range.value} of attribute ${subject.value}.`
      );
    }

    propertyObject.range = {
      id: rangeAssignedURI.value,
      listedInDocument: !!this.filterByRangeListedInDocument(
        rangeAssignedURI.value
      ),
    };

    const rangeVocabularyLabel: RDF.Literal | undefined = getVocabularyLabel(
      range,
      this.store,
      this.configuration.language
    );
    const rangeApplicationProfileLabel: RDF.Literal | undefined =
      getApplicationProfileLabel(
        range,
        this.store,
        this.configuration.language
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
    subject: RDF.NamedNode
  ): Pick<
    WebuniversumObject,
    'id' | 'vocabularyLabel' | 'applicationProfileLabel'
  > {
    const parentAssignedURI: RDF.NamedNode | undefined =
      this.store.getAssignedUri(subject);

    if (!parentAssignedURI) {
      throw new Error(
        `Unable to find the assigned URI for class ${subject.value} which acts as a parent.`
      );
    }

    const parentVocabularyLabel: RDF.Literal | undefined = getVocabularyLabel(
      subject,
      this.store,
      this.configuration.language
    );
    const parentApplicationProfileLabel: RDF.Literal | undefined =
      getApplicationProfileLabel(
        subject,
        this.store,
        this.configuration.language
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
