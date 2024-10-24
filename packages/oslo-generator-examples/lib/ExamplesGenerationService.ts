import fs from 'fs';
import path from 'path';
import {
  Logger,
  QuadStore,
  ServiceIdentifier,
  getApplicationProfileLabel,
  IService,
  ns,
} from '@oslo-flanders/core';
import { inject, injectable } from 'inversify';
import * as RDF from '@rdfjs/types';
import { ExamplesGenerationServiceConfiguration } from './config/ExamplesGenerationServiceConfiguration';
import { ExampleObject } from './interfaces/ExampleObject';
import { ExampleProperty } from './interfaces/ExampleProperty';
import { removeTrailingSlash, toCamelCase } from './utils/utils';
import { mapDataTypes } from './utils/DataTypes';

@injectable()
export class ExamplesGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: ExamplesGenerationServiceConfiguration;
  public readonly store: QuadStore;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration)
    config: ExamplesGenerationServiceConfiguration,
    @inject(ServiceIdentifier.QuadStore) store: QuadStore
  ) {
    this.logger = logger;
    this.configuration = config;
    this.store = store;
  }

  public async init(): Promise<void> {
    return this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    const classJobs = this.store
      .getClassIds()
      .map((classId) => this.generateExample(classId));

    const datatypeJobs = this.store
      .findSubjects(ns.rdf('type'), ns.rdfs('Datatype'))
      .map((datatypeId) => this.generateExample(<RDF.NamedNode>datatypeId));

    const classes: ExampleObject[] = await Promise.all(classJobs);
    const dataTypes: ExampleObject[] = await Promise.all(datatypeJobs);

    this.ensureOutputDirectory();

    this.writeExamples([...classes, ...dataTypes]);
  }

  ensureOutputDirectory(): void {
    const examplesDir = path.join(this.configuration.output);
    if (!fs.existsSync(examplesDir)) {
      fs.mkdirSync(examplesDir);
    }
  }

  writeExamples(examples: ExampleObject[]): void {
    const examplesDir = this.configuration.output;
    examples.forEach((example) => {
      const filePath = path.join(examplesDir, `${example.fileName}.json`);
      delete example.fileName;
      fs.writeFileSync(filePath, JSON.stringify(example, null, 2));
    });
  }

  generateExample(
    entity: RDF.NamedNode,
    includeProperties: boolean = true
  ): ExampleObject {
    const assignedURI: RDF.NamedNode | undefined =
      this.store.getAssignedUri(entity);

    if (!assignedURI) {
      throw new Error(
        `Unable to find the assigned URI for entity ${entity.value}.`
      );
    }

    const applicationProfileLabel: string | undefined = this.fetchProperty(
      getApplicationProfileLabel,
      entity
    );

    let properties: ExampleProperty[] = [];
    if (includeProperties) {
      properties = this.addPropertySpecificInformation(entity);
    }

    // Sort properties alphabetically by their keys
    properties.sort((a, b) =>
      Object.keys(a)[0].localeCompare(Object.keys(b)[0])
    );

    let example: ExampleObject = {
      '@context': `${removeTrailingSlash(
        this.configuration.contextBase
      )}/${toCamelCase(applicationProfileLabel ?? '')}.jsonld`,
      '@type': assignedURI.value,
      '@id': '{{ID}}',
      fileName: toCamelCase(applicationProfileLabel ?? ''),
      ...properties.reduce((acc, property) => ({ ...acc, ...property }), {}),
    };
    return example;
  }

  fetchProperty(
    fetchFunction: (
      subjectId: RDF.NamedNode,
      store: QuadStore,
      language: string
    ) => RDF.Literal | undefined,
    subject: RDF.NamedNode
  ): string | undefined {
    return fetchFunction(subject, this.store, this.configuration.language)
      ?.value;
  }

  generateExampleProperty(property: RDF.Term): ExampleProperty {
    const key: string = toCamelCase(
      getApplicationProfileLabel(
        property,
        this.store,
        this.configuration.language
      )?.value ?? 'noApLabel'
    );

    const range: RDF.NamedNode | undefined = this.store.getRange(property);
    if (!range) {
      throw new Error(`No range found for class ${property.value}.`);
    }

    const rangeAssignedURI: RDF.NamedNode | undefined =
      this.store.getAssignedUri(range);
    if (!rangeAssignedURI) {
      throw new Error(
        `Unable to find the assigned URI for range ${range.value} of attribute ${property.value}.`
      );
    }

    return {
      [key]: mapDataTypes(rangeAssignedURI.value, this.configuration.language),
    };
  }

  addPropertySpecificInformation(entity: RDF.NamedNode): ExampleProperty[] {
    const jobs: ExampleProperty[] = this.store
      .findSubjects(ns.rdfs('domain'), entity)
      .map((property: RDF.Term) => this.generateExampleProperty(property));

    return jobs;
  }
}
