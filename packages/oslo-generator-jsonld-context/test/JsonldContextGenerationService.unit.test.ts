/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @group unit
 */
import fs from 'fs/promises';
import { VoidLogger, QuadStore, OutputFormat } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import rdfParser from 'rdf-parse';
import { JsonldContextGenerationService } from '../lib/JsonldContextGenerationService';
import {
  classJsonld,
  classJsonldWithDuplicates,
  jsonldData, jsonldPropertyWithMaxCardinality, jsonLdWithoutAssignedUris, propertyJsonld,
  propertyJsonldWithDuplicates,
  propertyJsonldWithoutDomain,
  propertyJsonldWithoutDomainLabel,
  propertyJsonldWithoutLabel,
  propertyJsonldWithoutRange,
  propertyJsonldWithoutRangeAssignedURI,
} from './data/mockData';

jest.mock('@oslo-flanders/core', () => {
  return {
    ...jest.requireActual('@oslo-flanders/core'),
    createN3Store: jest.fn(),
  };
});

function parseJsonld(data: any): Promise<RDF.Quad[]> {
  const textStream = require('streamify-string')(JSON.stringify(data));

  return new Promise<RDF.Quad[]>((resolve, reject) => {
    const quads: RDF.Quad[] = [];
    rdfParser.parse(textStream, { contentType: OutputFormat.JsonLd})
      .on('data', (quad: RDF.Quad) => quads.push(quad))
      .on('error', (error: unknown) => reject(error))
      .on('end', () => resolve(quads));
  });
}

describe('JsonldContextGenerationService', () => {
  let store: QuadStore;
  const df: DataFactory = new DataFactory();
  const logger = new VoidLogger();

  beforeEach(() => {
    store = new QuadStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize the quad store in the init function', async () => {
    jest.spyOn(store, 'addQuadsFromFile').mockReturnValue(Promise.resolve());
    const service = <any>new JsonldContextGenerationService(
      logger,
      <any>{ language: 'en', output: 'context.jsonld' },
      store,
    );

    await service.init();

    expect(store.addQuadsFromFile).toHaveBeenCalled();
  });

  it('should write the jsonld context to a file', async () => {
    const service = <any>new JsonldContextGenerationService(
      logger,
      <any>{ language: 'en', output: 'context.jsonld' },
      store,
    );

    jest.spyOn(fs, 'writeFile');

    await service.run();


    expect(fs.writeFile).toHaveBeenCalledWith('context.jsonld', JSON.stringify({ '@context': {} }, null, 2));
  });

  it('should generate a regular context object', async () => {
    store.addQuads(await parseJsonld(jsonldData));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' }, store);

    const context = await service.generateContext();
    expect(context).toEqual({
      AnotherTestClass: 'http://example.org/id/class/2',
      TestClass: 'http://example.org/id/class/1',
      anotherTestProperty: {
        '@id': 'http://example.org/id/property/2',
        '@type': 'http://example.org/id/class/2',
      },
      testProperty: {
        '@id': 'http://example.org/id/property/1',
        '@type': 'http://example.org/id/class/2',
        '@container': '@set',
      },
    });
  });

  it('should generate a scoped context', async () => {
    store.addQuads(await parseJsonld(jsonldData));
    const service = <any>new JsonldContextGenerationService(logger, <any>{
      language: 'en',
      scopedContext: true,
    }, store);

    const context = await service.generateContext();
    expect(context).toEqual({
      "AnotherTestClass": {
        "@id": "http://example.org/id/class/2",
      },
      "TestClass": {
        "@id": "http://example.org/id/class/1",
        "@context": {
          "anotherTestProperty": {
            "@id": "http://example.org/id/property/2",
            "@type": "http://example.org/id/class/2",
          },
          "testProperty": {
            "@id": "http://example.org/id/property/1",
            "@type": "http://example.org/id/class/2",
            "@container": "@set",
          },
        },
      },
    });
  });

  it('should add prefixes to the context when addDomainPrefix is set', async () => {
    store.addQuads(await parseJsonld(jsonldData));
    const service = <any>new JsonldContextGenerationService(logger, <any>{
      language: 'en',
      addDomainPrefix: true,
    }, store);

    const context = await service.generateContext();
    expect(context).toEqual({
      AnotherTestClass: 'http://example.org/id/class/2',
      TestClass: 'http://example.org/id/class/1',
      'TestClass.anotherTestProperty': {
        '@id': 'http://example.org/id/property/2',
        '@type': 'http://example.org/id/class/2',
      },
      'TestClass.testProperty': {
        '@id': 'http://example.org/id/property/1',
        '@type': 'http://example.org/id/class/2',
        '@container': '@set',
      },
    });
  });

  it('should add prefixes to the context for duplicate properties', async () => {
    store.addQuads(await parseJsonld(propertyJsonldWithDuplicates));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' }, store);

    const context = await service.generateContext();
    expect(context).toEqual({
      AnotherTestDomain: 'http://example.org/id/class/2',
      'AnotherTestDomain.testLabel': {
        '@id': 'http://example.org/id/property/2',
        '@type': 'http://example.org/id/class/2',
      },
      TestDomain: 'http://example.org/id/class/1',
      'TestDomain.testLabel': {
        '@id': 'http://example.org/id/property/1',
        '@type': 'http://example.org/id/class/2',
      },
    });
  });

  it('should identify duplicate labels for the configured language', async () => {
    store.addQuads(await parseJsonld(classJsonldWithDuplicates));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' }, store);
    const subjects = <RDF.NamedNode[]>store.findQuads(null, null, null).map(x => x.subject);
    const duplicates = service.identifyDuplicateLabels(subjects);

    expect(duplicates)
      .toEqual(expect.arrayContaining(
        [expect.objectContaining(df.namedNode('http://example.org/.well-known/id/class/1'))],
      ));
    expect(duplicates)
      .toEqual(expect.arrayContaining(
        [expect.objectContaining(df.namedNode('http://example.org/.well-known/id/class/2'))],
      ));
  });

  it('should create an array of class metadata objects', async () => {
    store.addQuads(await parseJsonld(classJsonld));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'nl' }, store);

    const classMetadata = await service.createClassMetadata();

    expect(classMetadata.length).toBe(1);
    expect(classMetadata[0].assignedURI.value).toBe('http://example.org/id/class/1');
    expect(classMetadata[0].label.value).toBe('TestClass');
  });

  it('should log an error when a class subject appears in the duplicates array', async () => {
    store.addQuads(await parseJsonld(classJsonldWithDuplicates));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' }, store);

    jest.spyOn(service.logger, 'error');

    await service.generateContext();
    expect(service.logger.error).toHaveBeenCalledTimes(2);
  })


  it('should log an error when the assigned URI for a class can not be found', async () => {
    store.addQuads(await parseJsonld(jsonLdWithoutAssignedUris));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' }, store);

    jest.spyOn(service.logger, 'error');

    await service.createClassMetadata();
    expect(service.logger.error).toHaveBeenCalled();
  });

  it('should log an error when a class label is used multiple times', async () => {
    store.addQuads(await parseJsonld(classJsonldWithDuplicates));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' }, store);

    jest.spyOn(service.logger, 'error');

    await service.createClassMetadata();
    expect(service.logger.error).toHaveBeenCalled();
  });

  it('should log an error when a domain label can not be found', async () => {
    store.addQuads(await parseJsonld(classJsonld));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' }, store);

    jest.spyOn(service.logger, 'error');

    await service.createClassMetadata();
    expect(service.logger.error).toHaveBeenCalled();
  });

  it('should create an array of property metadata objects', async () => {
    store.addQuads(await parseJsonld(propertyJsonld));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' }, store);

    const propertyMetadata = await service.createPropertyMetadata();

    expect(propertyMetadata.length).toBe(1);
    expect(propertyMetadata[0].assignedURI.value).toBe('http://example.org/id/property/1');
    expect(propertyMetadata[0].label.value).toBe('Test');
    expect(propertyMetadata[0].rangeAssignedUri.value).toBe('http://example.org/id/class/2');
    expect(propertyMetadata[0].domainLabel.value).toBe('TestClass');
    expect(propertyMetadata[0].addContainer).toBe(false);
    expect(propertyMetadata[0].addPrefix).toBe(false);
  });

  it('should log an error when the assigned URI for a property can not be found', async () => {
    store.addQuads(await parseJsonld(jsonLdWithoutAssignedUris));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' }, store);

    jest.spyOn(service.logger, 'error');

    await service.createPropertyMetadata();
    expect(service.logger.error).toHaveBeenCalledWith(
      `Unable to find the assigned URI for attribute http://example.org/.well-known/id/property/2.`,
    );
  });

  it('should log an error when the label for a property can not be found', async () => {
    store.addQuads(await parseJsonld(propertyJsonldWithoutLabel));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' }, store);

    jest.spyOn(service.logger, 'error');

    await service.createPropertyMetadata();
    expect(service.logger.error).toHaveBeenCalledWith(
      // eslint-disable-next-line max-len
      'No label found for attribute http://example.org/.well-known/id/property/1 in language "en" or without language tag.',
    );
  });

  it('should log an error when the range of a property can not be found', async () => {
    store.addQuads(await parseJsonld(propertyJsonldWithoutRange));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' }, store);

    jest.spyOn(service.logger, 'error');

    await service.createPropertyMetadata();
    expect(service.logger.error).toHaveBeenCalledWith(
      'No range found for attribute http://example.org/.well-known/id/property/1.',
    );
  });

  it('should log an error when the assigned URI of the range for a property can not be found', async () => {
    store.addQuads(await parseJsonld(propertyJsonldWithoutRangeAssignedURI));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' }, store);

    jest.spyOn(service.logger, 'error');

    await service.createPropertyMetadata();
    expect(service.logger.error).toHaveBeenCalledWith(
      'Unable to find the assigned URI of range with id http://example.org/.well-known/id/class/1.',
    );
  });

  it('should log an error when the domain for a property can not be found', async () => {
    store.addQuads(await parseJsonld(propertyJsonldWithoutDomain));
    const service = <any>new JsonldContextGenerationService(
      logger,
      <any>{ language: 'en', addDomainPrefix: true },
      store,
    );

    jest.spyOn(service.logger, 'error');

    await service.createPropertyMetadata();
    expect(service.logger.error).toHaveBeenCalledWith(
      'No domain found for attribute http://example.org/.well-known/id/property/1.',
    );
  });

  it('should log an error when the label for a domain can not be found', async () => {
    store.addQuads(await parseJsonld(propertyJsonldWithoutDomainLabel));
    const service = <any>new JsonldContextGenerationService(
      logger,
      <any>{ language: 'en', addDomainPrefix: true },
      store,
    );

    jest.spyOn(service.logger, 'error');

    await service.createPropertyMetadata();
    expect(service.logger.error).toHaveBeenCalledWith(
      // eslint-disable-next-line max-len
      'No label found for domain http://example.org/.well-known/id/class/2 of attribute http://example.org/.well-known/id/property/1.',
    );
  });

  it('should determine if an attribute can have multiple values', async () => {
    store.addQuads(await parseJsonld(jsonldPropertyWithMaxCardinality));
    const service = <any>new JsonldContextGenerationService(
      logger,
      <any>{ language: 'en', addDomainPrefix: false },
      store,
    );

    const canHaveMultipleValues = service.canHaveAListOfValues(
      df.namedNode('http://example.org/.well-known/id/property/1'),
    );
    expect(canHaveMultipleValues).toBe(true);

    const canNotHaveMultipleValues = service.canHaveAListOfValues(
      df.namedNode('http://example.org/.well-known/id/property/2'),
    );
    expect(canNotHaveMultipleValues).toBe(false);
  });

  it('should log a warning when max cardinality is not present for attribute', async () => {
    store.addQuads(await parseJsonld(propertyJsonld));
    const service = <any>new JsonldContextGenerationService(
      logger,
      <any>{ language: 'en', addDomainPrefix: false },
      store,
    );

    jest.spyOn(service.logger, 'warn');
    service.canHaveAListOfValues(
      df.namedNode('http://example.org/.well-known/id/property/1'),
    );

    expect(service.logger.warn)
      .toHaveBeenCalledWith(`Unable to retrieve max cardinality of property http://example.org/.well-known/id/property/1.`);
  });
});
