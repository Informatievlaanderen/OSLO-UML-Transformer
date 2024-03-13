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
  getCodelist
} from "@oslo-flanders/core";
import { inject, injectable } from "inversify";
import { JsonWebuniversumGenerationServiceConfiguration } from "@oslo-generator-json-webuniversum/config/JsonWebuniversumGenerationServiceConfiguration";
import type * as RDF from '@rdfjs/types';
import { writeFile } from "fs/promises";
import { WebuniversumObject } from "@oslo-generator-json-webuniversum/types/WebuniversumObject";
import { WebuniversumProperty } from "@oslo-generator-json-webuniversum/types/WebuniversumProperty";
import { sortWebuniversumObjects } from "@oslo-generator-json-webuniversum/utils/utils";

@injectable()
export class JsonWebuniversumGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: JsonWebuniversumGenerationServiceConfiguration;
  public readonly store: QuadStore;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration) configuration: JsonWebuniversumGenerationServiceConfiguration,
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
    const classJobs = this.store.getClassIds()
      .map(classId => this.generateEntityData(classId));

    const datatypeJobs = this.store.findSubjects(ns.rdf('type'), ns.rdfs('Datatype'))
      .map(datatypeId => this.generateEntityData(<RDF.NamedNode>datatypeId));

    const classes: WebuniversumObject[] = await Promise.all(classJobs)
    const datatypes: WebuniversumObject[] = await Promise.all(datatypeJobs)

    // Sort entities
    sortWebuniversumObjects(classes, this.configuration.language);
    classes.forEach((classObject: WebuniversumObject) => sortWebuniversumObjects(classObject.properties || [], this.configuration.language));

    sortWebuniversumObjects(datatypes, this.configuration.language);
    datatypes.forEach((datatypeObject: WebuniversumObject) => sortWebuniversumObjects(datatypeObject.properties || [], this.configuration.language));

    const baseURI = this.getBaseURI();

    const template = { baseURI, classes: classes, dataTypes: datatypes };
    await writeFile(this.configuration.output, JSON.stringify(template, null, 2), 'utf-8');
  }

  private getBaseURI(): string {
    const packageSubject: RDF.Term = <RDF.Term>this.store.findQuad(null, ns.rdf('type'), ns.oslo('Package'))?.subject;

    if (!packageSubject) {
      throw new Error(`Unable to find the subject for the package.`);
    }

    const baseURIObject: RDF.Literal | undefined = <RDF.Literal | undefined>this.store.findObject(packageSubject, ns.oslo('baseURI'));

    if (!baseURIObject) {
      throw new Error(`Unable to find the baseURI for the package.`);
    }

    return baseURIObject.value;
  }

  private async generateEntityData(entity: RDF.NamedNode, includeProperties: boolean = true): Promise<WebuniversumObject> {
    const assignedURI: RDF.NamedNode | undefined = this.store.getAssignedUri(entity);
    if (!assignedURI) {
      throw new Error(`Unable to find the assigned URI for entity ${entity.value}.`);
    }

    const fetchProperty = (fetchFunction: (subjectId: RDF.NamedNode, store: QuadStore, language: string) => RDF.Literal | undefined, subject: RDF.NamedNode) =>
      fetchFunction(subject, this.store, this.configuration.language)?.value;

    const vocabularyLabel: string | undefined = fetchProperty(getVocabularyLabel, entity);
    const applicationProfileLabel: string | undefined = fetchProperty(getApplicationProfileLabel, entity);
    const vocabularyDefinition: string | undefined = fetchProperty(getVocabularyDefinition, entity);
    const applicationProfileDefinition: string | undefined = fetchProperty(getApplicationProfileDefinition, entity);
    const vocabularyUsageNote: string | undefined = fetchProperty(getVocabularyUsageNote, entity);
    const applicationProfileUsageNote: string | undefined = fetchProperty(getApplicationProfileUsageNote, entity);

    const parentsIds: RDF.NamedNode[] = includeProperties ? this.store.getParentsOfClass(entity) : this.store.getParentOfProperty(entity) !== undefined ? [this.store.getParentOfProperty(entity)!] : [];
    const parentObjects: Pick<WebuniversumObject, 'id' | 'vocabularyLabel' | 'applicationProfileLabel'>[] = parentsIds.map(parentId => this.createParentObject(parentId));

    const scope: string | undefined = this.store.getScope(entity)?.value;

    const entityData: WebuniversumObject = {
      id: assignedURI.value,
      ...vocabularyLabel && {
        vocabularyLabel: { [this.configuration.language]: vocabularyLabel },
      },
      ...applicationProfileLabel && {
        applicationProfileLabel: { [this.configuration.language]: applicationProfileLabel },
      },
      ...vocabularyDefinition && {
        vocabularyDefinition: { [this.configuration.language]: vocabularyDefinition },
      },
      ...applicationProfileDefinition && {
        applicationProfileDefinition: { [this.configuration.language]: applicationProfileDefinition },
      },
      ...vocabularyUsageNote && {
        vocabularyUsageNote: { [this.configuration.language]: vocabularyUsageNote },
      },
      ...applicationProfileUsageNote && {
        applicationProfileUsageNote: { [this.configuration.language]: applicationProfileUsageNote },
      },
      ...parentObjects.length > 0 && {
        parents: parentObjects
      },
      ...scope && {
        scope: scope,
      }
    };

    if (includeProperties) {
      const jobs: Promise<WebuniversumProperty>[] = this.store.findSubjects(ns.rdfs('domain'), entity)
        .map<Promise<WebuniversumProperty>>(async (property: RDF.Term) => {
          return <Promise<WebuniversumProperty>>this.generateEntityData(<RDF.NamedNode>property, false)
            .then((propertyObject) => this.addPropertySpecificInformation(<RDF.NamedNode>property, <WebuniversumProperty>propertyObject, assignedURI));
        });

      const properties: WebuniversumProperty[] = await Promise.all(jobs)

      if (properties.length) {
        entityData.properties = properties;
      }
    }

    return entityData;
  }

  private addPropertySpecificInformation(subject: RDF.NamedNode, propertyObject: WebuniversumProperty, domainId: RDF.NamedNode): WebuniversumProperty {
    propertyObject.domain = domainId.value;

    const range: RDF.NamedNode | undefined = this.store.getRange(subject);
    if (!range) {
      throw new Error(`No range found for class ${subject.value}.`);
    }

    const rangeAssignedURI: RDF.NamedNode | undefined = this.store.getAssignedUri(range);
    if (!rangeAssignedURI) {
      throw new Error(`Unable to find the assigned URI for range ${range.value} of attribute ${subject.value}.`);
    }

    propertyObject.range = { id: rangeAssignedURI.value };

    const rangeVocabularyLabel: RDF.Literal | undefined = getVocabularyLabel(range, this.store, this.configuration.language);
    const rangeApplicationProfileLabel: RDF.Literal | undefined = getApplicationProfileLabel(range, this.store, this.configuration.language);
    rangeVocabularyLabel && (propertyObject.range.vocabularyLabel = { [this.configuration.language]: rangeVocabularyLabel.value });
    rangeApplicationProfileLabel && (propertyObject.range.applicationProfileLabel = { [this.configuration.language]: rangeApplicationProfileLabel.value });

    getMinCount(subject, this.store) && (propertyObject.minCount = getMinCount(subject, this.store));
    getMaxCount(subject, this.store) && (propertyObject.maxCount = getMaxCount(subject, this.store));
    getCodelist(subject, this.store) && (propertyObject.codelist = getCodelist(subject, this.store));

    return propertyObject;
  }

  private createParentObject(subject: RDF.NamedNode): Pick<WebuniversumObject, 'id' | 'vocabularyLabel' | 'applicationProfileLabel'> {
    const parentAssignedURI: RDF.NamedNode | undefined = this.store.getAssignedUri(subject);

    if (!parentAssignedURI) {
      throw new Error(`Unable to find the assigned URI for class ${subject.value} which acts as a parent.`);
    }

    const parentVocabularyLabel: RDF.Literal | undefined = getVocabularyLabel(subject, this.store, this.configuration.language);
    const parentApplicationProfileLabel: RDF.Literal | undefined = getApplicationProfileLabel(subject, this.store, this.configuration.language);

    return {
      id: parentAssignedURI.value,
      ...parentVocabularyLabel && {
        vocabularyLabel: { [this.configuration.language]: parentVocabularyLabel.value },
      },
      ...parentApplicationProfileLabel && {
        applicationProfileLabel: { [this.configuration.language]: parentApplicationProfileLabel.value },
      },
    }
  }
}