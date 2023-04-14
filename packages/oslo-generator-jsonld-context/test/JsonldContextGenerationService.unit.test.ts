/**
 * @group unit
 */
import fs from 'fs/promises';
import { VoidLogger, WinstonLogger, LOG_LEVELS, QuadStore } from '@oslo-flanders/core';
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
  propertyJsonldWithoutRange,
  propertyJsonldWithStatement,
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
    rdfParser.parse(textStream, { contentType: 'application/ld+json' })
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

    // eslint-disable-next-line @typescript-eslint/object-curly-spacing
    expect(fs.writeFile).toBeCalledWith('context.jsonld', JSON.stringify({ '@context': {} }, null, 2));
  });

  it('should generate a context object', async () => {
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

  it('should log an error when a class label is used multiple times', async () => {
    store.addQuads(await parseJsonld(classJsonldWithDuplicates));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' }, store);

    jest.spyOn(service.logger, 'error');

    await service.createClassLabelUriMap();
    expect(service.logger.error).toHaveBeenCalled();
  });

  it('should create a class label URI map', async () => {
    store.addQuads(await parseJsonld(classJsonld));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'nl' }, store);
    const classLabelUriMap: Map<string, RDF.NamedNode> = await service.createClassLabelUriMap();

    expect(classLabelUriMap.size).toBe(1);
    expect(classLabelUriMap.has('TestClass')).toBeTruthy();
    expect(classLabelUriMap.get('TestClass')).toBe('http://example.org/id/class/1');
  });

  it('should log a warning when a class label can not be found', async () => {
    store.addQuads(await parseJsonld(classJsonld));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' }, store);

    jest.spyOn(service.logger, 'warn');

    await service.createClassLabelUriMap();
    expect(service.logger.warn).toHaveBeenCalled();
  });

  it('should log an error when the label for a property can not be found in the desired language', async () => {
    store.addQuads(await parseJsonld(propertyJsonld));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'nl' }, store);

    jest.spyOn(service.logger, 'error');

    await service.createPropertyLabelMap();
    expect(service.logger.error)
      .toHaveBeenCalledWith(
        // eslint-disable-next-line max-len
        'No label found for attribute http://example.org/.well-known/id/property/1 in language "nl" or without language tag.',
      );
  });

  it('should log an error when the range of a property can not be found', async () => {
    store.addQuads(await parseJsonld(propertyJsonldWithoutRange));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' }, store);

    jest.spyOn(service.logger, 'error');

    await service.createPropertyLabelMap();
    expect(service.logger.error)
      .toHaveBeenCalledWith('No range found for attribute http://example.org/.well-known/id/property/1.');
  });

  it('should log an error when the domain of a property can not be found', async () => {
    store.addQuads(await parseJsonld(propertyJsonldWithoutDomain));
    const service = <any>new JsonldContextGenerationService(
      logger,
      <any>{ language: 'en', addDomainPrefix: true },
      store,
    );

    jest.spyOn(service.logger, 'error');

    await service.createPropertyLabelMap();
    expect(service.logger.error)
      .toHaveBeenCalledWith('No domain found for attribute http://example.org/.well-known/id/property/1.');
  });

  it('should log an error when the domain label can not be found', async () => {
    store.addQuads(await parseJsonld(propertyJsonld));
    const service = <any>new JsonldContextGenerationService(
      logger,
      <any>{ language: 'en', addDomainPrefix: true },
      store,
    );

    jest.spyOn(service.logger, 'error');

    await service.createPropertyLabelMap();
    expect(service.logger.error)
      // eslint-disable-next-line max-len
      .toHaveBeenCalledWith('No label found for domain http://example.org/.well-known/id/class/1 of attribute http://example.org/.well-known/id/property/1.');
  });

  it('should generate a property label uri map', async () => {
    store.addQuads(await parseJsonld(propertyJsonld));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' }, store);

    const map = await service.createPropertyLabelMap();

    expect(map.has('test')).toBeTruthy();

    const value = map.get('test');

    expect(value.uri.value).toBe('http://example.org/id/property/1');
    expect(value.range.value).toBe('http://example.org/id/class/2');
  });

  it('should add the domain label prefix when this option is set in configuration', async () => {
    store.addQuads(await parseJsonld(propertyJsonldWithStatement));
    const testLogger = new WinstonLogger(LOG_LEVELS[0]);
    const service = <any>new JsonldContextGenerationService(
      testLogger,
      <any>{ language: 'en', addDomainPrefix: true },
      store,
    );

    const map = await service.createPropertyLabelMap();

    expect(map.has('TestDomain.test')).toBeTruthy();

    const value = map.get('TestDomain.test');

    expect(value.uri.value).toBe('http://example.org/id/property/1');
    expect(value.range.value).toBe('http://example.org/id/class/2');
  });

  it('should add the domain label as prefix when duplicate property labels are detected', async () => {
    store.addQuads(await parseJsonld(propertyJsonldWithDuplicates));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' }, store);

    const map = await service.createPropertyLabelMap();

    expect(map.has('TestDomain.testLabel')).toBeTruthy();
    expect(map.has('AnotherTestDomain.testLabel')).toBeTruthy();
  });

  it('should log an error when an assigned URI could not be found', async () => {
    store.addQuads(await parseJsonld(jsonLdWithoutAssignedUris));
    const service = <any>new JsonldContextGenerationService(
      logger,
      <any>{ language: 'en', addDomainPrefix: false },
      store,
    );

    jest.spyOn(service.logger, 'error');
    await service.createClassLabelUriMap();
    expect(service.logger.error)
      .toHaveBeenCalledWith(`Unable to find the assigned URI for class http://example.org/.well-known/id/class/1.`);

    await service.createPropertyLabelMap();
    expect(service.logger.error)
      // eslint-disable-next-line max-len
      .toHaveBeenCalledWith('Unable to find the assigned URI for attribute http://example.org/.well-known/id/property/2.');
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
