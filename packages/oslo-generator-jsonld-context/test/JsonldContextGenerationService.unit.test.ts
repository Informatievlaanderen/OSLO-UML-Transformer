/**
 * @group unit
 */
import fs from 'fs/promises';
import { VoidLogger, createN3Store } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import * as N3 from 'n3';
import { DataFactory } from 'rdf-data-factory';
import rdfParser from 'rdf-parse';
import { JsonldContextGenerationService } from '../lib/JsonldContextGenerationService';
import {
  classJsonld,
  classJsonldWithDuplicates,
  jsonldData, propertyJsonld,
  propertyJsonldWithDuplicates,
  propertyJsonldWithMultipleStatements,
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
  let store: N3.Store;
  const df: DataFactory = new DataFactory();
  const logger = new VoidLogger();

  beforeEach(() => {
    store = new N3.Store();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should write the jsonld context to a file', async () => {
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en', output: 'context.jsonld' });
    (<any>createN3Store).mockReturnValue(Promise.resolve(new N3.Store()));
    jest.spyOn(fs, 'writeFile');

    await service.run();

    // eslint-disable-next-line @typescript-eslint/object-curly-spacing
    expect(fs.writeFile).toBeCalledWith('context.jsonld', JSON.stringify({ '@context': {} }, null, 2));
  });

  it('should generate a context object', async () => {
    store.addQuads(await parseJsonld(jsonldData));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' });

    const context = await service.generateContext(store);
    expect(context).toEqual({
      AnotherTestClass: 'http://example.org/id/class/2',
      TestClass: 'http://example.org/id/class/1',
      anotherTestProperty: {
        '@id': 'http://example.org/id/property/2',
        '@type': 'http://example.org/id/class/2'
      },
      testProperty: {
        '@id': 'http://example.org/id/property/1',
        '@type': 'http://example.org/id/class/2'
      },
    });
  });

  it('should identify duplicate URIs', async () => {
    store.addQuads(await parseJsonld(classJsonldWithDuplicates));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' });
    const duplicates = service.identifyDuplicateLabels(store.getSubjects(null, null, null), store);

    expect(duplicates)
      .toEqual(expect.arrayContaining([expect.objectContaining(df.namedNode('http://example.org/id/class/1'))]));
    expect(duplicates)
      .toEqual(expect.arrayContaining([expect.objectContaining(df.namedNode('http://example.org/id/class/2'))]));
  });

  it('should log an error when a class label is used multiple times', async () => {
    store.addQuads(await parseJsonld(classJsonldWithDuplicates));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' });

    jest.spyOn(service.logger, 'error');

    await service.createClassLabelUriMap(store);
    expect(service.logger.error).toHaveBeenCalled();
  });

  it('should create a class label URI map', async () => {
    store.addQuads(await parseJsonld(classJsonld));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'nl' });
    const classLabelUriMap: Map<string, RDF.NamedNode> = await service.createClassLabelUriMap(store);

    expect(classLabelUriMap.size).toBe(1);
    expect(classLabelUriMap.has('TestClass')).toBeTruthy();
    expect(classLabelUriMap.get('TestClass')).toBe('http://example.org/id/class/1');
  });

  it('should log a warning when a class label can not be found', async () => {
    store.addQuads(await parseJsonld(classJsonld));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' });

    jest.spyOn(service.logger, 'warn');

    await service.createClassLabelUriMap(store);
    expect(service.logger.warn).toHaveBeenCalled();
  });

  it('should log an error when the label for a property can not be found in the desired language', async () => {
    store.addQuads(await parseJsonld(propertyJsonld));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'nl' });

    jest.spyOn(service.logger, 'error');

    await service.createPropertyLabelMap(store);
    expect(service.logger.error)
      .toHaveBeenCalledWith(
        'No label found for attribute http://example.org/id/property/1 in language "nl" or without language tag.',
      );
  });

  it('should log an error when the range of a property can not be found', async () => {
    store.addQuads(await parseJsonld(propertyJsonldWithoutRange));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' });

    jest.spyOn(service.logger, 'error');

    await service.createPropertyLabelMap(store);
    expect(service.logger.error)
      .toHaveBeenCalledWith('No range found for attribute http://example.org/id/property/1.');
  });

  it('should log an error when the domain of a property can not be found', async () => {
    store.addQuads(await parseJsonld(propertyJsonldWithoutDomain));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en', addDomainPrefix: true });

    jest.spyOn(service.logger, 'error');

    await service.createPropertyLabelMap(store);
    expect(service.logger.error)
      .toHaveBeenCalledWith('No domain found for attribute http://example.org/id/property/1.');
  });

  it('should log an error when multiple rdf:Statements can be used to retrieve domain label information', async () => {
    store.addQuads(await parseJsonld(propertyJsonldWithMultipleStatements));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en', addDomainPrefix: true });

    jest.spyOn(service.logger, 'error');

    await service.createPropertyLabelMap(store);
    expect(service.logger.error)
      .toHaveBeenCalledWith('Found multiple usable subjects for the statement.');
  });

  it('should log an error when the domain label can not be found', async () => {
    store.addQuads(await parseJsonld(propertyJsonld));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en', addDomainPrefix: true });

    jest.spyOn(service.logger, 'error');

    await service.createPropertyLabelMap(store);
    expect(service.logger.error)
      // eslint-disable-next-line max-len
      .toHaveBeenCalledWith('No label found for domain http://example.org/id/class/1 of attribute http://example.org/id/property/1.');
  });

  it('should generate a property label uri map', async () => {
    store.addQuads(await parseJsonld(propertyJsonld));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' });

    const map = await service.createPropertyLabelMap(store);

    expect(map.has('test')).toBeTruthy();

    const value = map.get('test');

    expect(value.uri.value).toBe('http://example.org/id/property/1');
    expect(value.range.value).toBe('http://example.org/id/class/2');
  });

  it('should add the domain label as prefix when "addDomainPrefix" option is configured', async () => {
    store.addQuads(await parseJsonld(propertyJsonldWithStatement));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en', addDomainPrefix: true });

    const map = await service.createPropertyLabelMap(store);

    expect(map.has('TestDomain.test')).toBeTruthy();

    const value = map.get('TestDomain.test');

    expect(value.uri.value).toBe('http://example.org/id/property/1');
    expect(value.range.value).toBe('http://example.org/id/class/2');
  });

  it('should add the domain label as prefix when duplicate property labels are detected', async () => {
    store.addQuads(await parseJsonld(propertyJsonldWithDuplicates));
    const service = <any>new JsonldContextGenerationService(logger, <any>{ language: 'en' });

    const map = await service.createPropertyLabelMap(store);

    expect(map.has('TestDomain.testLabel')).toBeTruthy();
    expect(map.has('AnotherTestDomain.testLabel')).toBeTruthy();
  });
});
