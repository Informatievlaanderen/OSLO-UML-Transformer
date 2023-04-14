/**
 * @group unit
 */
import 'reflect-metadata';
import fs from 'fs';
import { Readable, Writable } from 'stream';
import { QuadStore, VoidLogger, ns } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import rdfParser from 'rdf-parse';
import rdfSerializer from 'rdf-serialize';
import { RdfVocabularyGenerationService } from '../lib/RdfVocabularyGenerationService';
import {
  jsonldAttributeWithoutAssignedUri,
  jsonldAttributeWithoutDomain,
  jsonldAttributeWithParent,
  jsonldAttributeWithRangeStatement,
  jsonldClassWithoutAssignedUri,
  jsonldClassWithoutDefinition,
  jsonldClassWithParent,
  jsonldDomainWithoutAssignedUri,
  jsonldDomainWithoutRange,
  jsonldPackage,
  jsonldPackageWithoutAssignedUri,
  jsonldParentWithoutAssignedUri,
  jsonldRangeWithoutAssignedUri,
  jsonldWithClassAndProperty,
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

describe('RdfVocabularyGenerationService', () => {
  let store: QuadStore;
  let service: any;
  const df: DataFactory = new DataFactory();
  const logger = new VoidLogger();
  const vocabularyUri: RDF.NamedNode = df.namedNode('http://example.org/vocabularyUri');

  beforeEach(() => {
    store = new QuadStore();
    service = <any>new RdfVocabularyGenerationService(
      logger, <any>{ language: 'en', output: 'output.jsonld', contentType: 'text/turtle' }, store,
    );

    jest.mock('streamify-array', () => {
      return {
        ...(jest.requireActual('streamify-array')),
        streamifyArray: jest.fn().mockReturnValue(new Readable()),
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize the quad store in the init function', async () => {
    jest.spyOn(store, 'addQuadsFromFile').mockReturnValue(Promise.resolve());
    await service.init();

    expect(store.addQuadsFromFile).toHaveBeenCalled();
  });

  it('should throw an error when the package well known id can not be found', async () => {
    await expect(async () => await service.run()).rejects.toThrowError();
  });

  it('should throw an error when the vocabulary URI can not be found', async () => {
    store.addQuads(await parseJsonld(jsonldPackageWithoutAssignedUri));
    await expect(async () => await service.run()).rejects.toThrowError();
  });

  it('should write serialized RDF to a file', async () => {
    store.addQuads(await parseJsonld(jsonldPackage));

    const mockStream = new Writable();
    mockStream._write = size => { /* Do nothing */ };

    jest.spyOn(fs, 'createWriteStream').mockReturnValue(<any>mockStream);
    jest.spyOn(rdfSerializer, 'serialize');

    await service.run();

    expect(fs.createWriteStream).toHaveBeenCalled();
    expect(rdfSerializer.serialize).toHaveBeenCalled();
  });

  it('should create a quad describing the vocabulary as an ontology', async () => {
    const quads = await service.createVocabularyInformationQuads(vocabularyUri);

    expect(quads.length).toBe(1);
    expect(quads.some((quad: RDF.Quad) =>
      quad.subject.equals(vocabularyUri) &&
      quad.predicate.equals(ns.rdf('type')) &&
      quad.object.equals(ns.owl('Ontology'))))
      .toBe(true);
  });

  it('should create quads to describe a class', async () => {
    store.addQuads(await parseJsonld(jsonldWithClassAndProperty));
    const quads = await service.extractClassQuads(vocabularyUri);

    expect(quads.length).toBe(4);
    expect(quads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/class/1')) &&
      quad.object.equals(ns.owl('Class'))))
      .toBe(true);

    expect(quads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/class/1')) &&
      quad.predicate.equals(ns.rdfs('isDefinedBy')) &&
      quad.object.equals(vocabularyUri)))
      .toBe(true);

    expect(quads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/class/1')) &&
      quad.predicate.equals(ns.rdfs('comment')) &&
      quad.object.equals(df.literal('A comment', 'en'))))
      .toBe(true);

    expect(quads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/class/1')) &&
      quad.predicate.equals(ns.vann('usageNote')) &&
      quad.object.equals(df.literal('A usage note', 'en'))))
      .toBe(true);
  });

  it('should log an error when the class assigned URI could not be found', async () => {
    store.addQuads(await parseJsonld(jsonldClassWithoutAssignedUri));

    jest.spyOn(service.logger, 'error');
    await service.extractClassQuads(vocabularyUri);

    expect(service.logger.error).toHaveBeenCalled();
  });

  it('should log an error when the definition of a class could not be found', async () => {
    store.addQuads(await parseJsonld(jsonldClassWithoutDefinition));

    jest.spyOn(service.logger, 'error');
    await service.extractClassQuads(vocabularyUri);

    expect(service.logger.error).toHaveBeenCalled();
  });

  it('should add a quad with the URI of the parent if that information is available', async () => {
    store.addQuads(await parseJsonld(jsonldClassWithParent));
    const quads = await service.extractClassQuads(vocabularyUri);

    expect(quads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/class/1')) &&
      quad.predicate.equals(ns.rdfs('subClassOf')) &&
      quad.object.equals(df.namedNode('http://example.org/id/class/2'))))
      .toBe(true);
  });

  it('should throw an error if the parent assigned URI of a class can not be found', async () => {
    store.addQuads(await parseJsonld(jsonldParentWithoutAssignedUri));
    await expect(async () => await service.extractClassQuads(store, vocabularyUri)).rejects.toThrowError();
  });

  it('should create quads to describe an attribute', async () => {
    store.addQuads(await parseJsonld(jsonldWithClassAndProperty));
    const quads = await service.createAttributeQuads(vocabularyUri);

    expect(quads.length).toBe(6);
    expect(quads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/property/1')) &&
      quad.object.equals(ns.owl('DatatypeProperty'))))
      .toBe(true);

    expect(quads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/property/1')) &&
      quad.predicate.equals(ns.rdfs('isDefinedBy')) &&
      quad.object.equals(vocabularyUri)))
      .toBe(true);

    expect(quads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/property/1')) &&
      quad.predicate.equals(ns.rdfs('domain')) &&
      quad.object.equals(df.namedNode('http://example.org/id/class/1'))))
      .toBe(true);

    expect(quads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/property/1')) &&
      quad.predicate.equals(ns.rdfs('range')) &&
      quad.object.equals(df.namedNode('http://example.org/id/class/1'))))
      .toBe(true);

    expect(quads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/property/1')) &&
      quad.predicate.equals(ns.rdfs('comment')) &&
      quad.object.equals(df.literal('Comment on property', 'en'))))
      .toBe(true);

    expect(quads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/property/1')) &&
      quad.predicate.equals(ns.vann('usageNote')) &&
      quad.object.equals(df.literal('A usage note of the property', 'en'))))
      .toBe(true);
  });

  it('should log an error when the assigned URI of the attribute could not be found', async () => {
    store.addQuads(await parseJsonld(jsonldAttributeWithoutAssignedUri));

    jest.spyOn(service.logger, 'error');
    await service.createAttributeQuads(vocabularyUri);

    expect(service.logger.error).toHaveBeenCalled();
  });

  it('should log an error when the well known id of the domain could not be found', async () => {
    store.addQuads(await parseJsonld(jsonldAttributeWithoutDomain));

    jest.spyOn(service.logger, 'error');
    await service.createAttributeQuads(vocabularyUri);

    expect(service.logger.error).toHaveBeenCalled();
  });

  it('should log an error when the assigned URI of the domain could not be found', async () => {
    store.addQuads(await parseJsonld(jsonldDomainWithoutAssignedUri));

    jest.spyOn(service.logger, 'error');
    await service.createAttributeQuads(vocabularyUri);

    expect(service.logger.error).toHaveBeenCalled();
  });

  it('should log an error when the well known id of the range could not be found', async () => {
    store.addQuads(await parseJsonld(jsonldDomainWithoutRange));

    jest.spyOn(service.logger, 'error');
    await service.createAttributeQuads(vocabularyUri);

    expect(service.logger.error).toHaveBeenCalled();
  });

  it('should log an error when the assigned URI of the range could not be found', async () => {
    store.addQuads(await parseJsonld(jsonldRangeWithoutAssignedUri));

    jest.spyOn(service.logger, 'error');
    await service.createAttributeQuads(vocabularyUri);

    expect(service.logger.error).toHaveBeenCalled();
  });

  it('should search in rdf:Statements for the assigned URI of a range', async () => {
    store.addQuads(await parseJsonld(jsonldAttributeWithRangeStatement));
    const quads = await service.createAttributeQuads(vocabularyUri);

    expect(quads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/property/1')) &&
      quad.predicate.equals(ns.rdfs('range')) &&
      quad.object.equals(df.namedNode('http://example.org/id/class/2'))))
      .toBe(true);
  });

  it('should add a link to the parent of the attribute it that information was found', async () => {
    store.addQuads(await parseJsonld(jsonldAttributeWithParent));
    const quads = await service.createAttributeQuads(vocabularyUri);

    expect(quads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/property/1')) &&
      quad.predicate.equals(ns.rdfs('subPropertyOf')) &&
      quad.object.equals(df.namedNode('http://example.org/id/parent/1'))))
      .toBe(true);
  });

  // eslint-disable-next-line max-len
  it('should log an error when the definition of the attribute could not be found in the requested language', async () => {
    // This 'jsonldAttributeWithRangeStatement' snippet can also be used for this test
    store.addQuads(await parseJsonld(jsonldAttributeWithRangeStatement));

    jest.spyOn(service.logger, 'error');
    await service.createAttributeQuads(vocabularyUri);

    expect(service.logger.error).toHaveBeenCalled();
  });
});
