/**
 * @group unit
 */
import 'reflect-metadata';
import { Readable } from 'stream';
import { QuadStore, VoidLogger, OutputFormat, ns } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import rdfParser from 'rdf-parse';
import { OutputHandlerService } from '../lib/OutputHandlerService';
import { RmlGenerationService } from '../lib/RmlGenerationService';
import {
  RmlClassJoinMockData,
  RmlLangStringMockData,
  RmlIntegerMockData,
  RmlConceptMockData,
} from './data/rmlMockData';

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
    rdfParser
      .parse(textStream, { contentType: OutputFormat.JsonLd })
      .on('data', (quad: RDF.Quad) => quads.push(quad))
      .on('error', (error: unknown) => reject(error))
      .on('end', () => resolve(quads));
  });
}

describe('RmlGenerationService', () => {
  let store: QuadStore;
  let service: any;
  const df: DataFactory = new DataFactory();
  const logger = new VoidLogger();
  const config: any = {
    language: 'nl',
    input: 'input.jsonld',
    output: 'mappingsDirectory',
    outputFormat: OutputFormat.turtle,
  };
  const outputHandlerService = new OutputHandlerService(logger, config);

  beforeEach(() => {
    store = new QuadStore();
    service = <any>(
      new RmlGenerationService(logger, config, store, outputHandlerService)
    );

    jest.mock('streamify-array', () => {
      return {
        ...jest.requireActual('streamify-array'),
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

  it('should generate a valid RML mapping (class join)', async () => {
    const triplesMapId = df.blankNode();
    const subjectMapId = df.blankNode();
    const predicateObjectMapId = df.blankNode();
    const predicateMapId = df.blankNode();
    const objectMapId = df.blankNode();
    const expectedStore = new QuadStore();
    expectedStore.addQuads([
      df.quad(triplesMapId, ns.rdf('type'), ns.rml('TriplesMap')),
      df.quad(triplesMapId, ns.rml('subjectMap'), subjectMapId),
      df.quad(
        subjectMapId,
        ns.rml('template'),
        df.literal('https://data.vlaanderen.be/id/DomainClassLabel/{id}'),
      ),
      df.quad(
        subjectMapId,
        ns.rml('class'),
        df.namedNode('http://example.org/id/class/2'),
      ),
      df.quad(triplesMapId, ns.rml('predicateObjectMap'), predicateObjectMapId),
      df.quad(predicateObjectMapId, ns.rml('predicateMap'), predicateMapId),
      df.quad(
        predicateMapId,
        ns.rml('predicate'),
        df.namedNode('http://example.org/id/property/1'),
      ),
      df.quad(predicateObjectMapId, ns.rml('objectMap'), objectMapId),
      df.quad(
        objectMapId,
        ns.rml('template'),
        df.literal('https://data.vlaanderen.be/id/DatatypeClassLabel/{id}'),
      ),
      df.quad(objectMapId, ns.rml('termType'), ns.rml('IRI')),
    ]);

    const objectId = df.blankNode();
    await service.store.addQuads(await parseJsonld(RmlClassJoinMockData));
    await service.run();

    expect(service.rmlStore === expectedStore);
  });

  it('should generate a valid RML mapping (rdf:LangString)', async () => {
    const triplesMapId = df.blankNode();
    const subjectMapId = df.blankNode();
    const predicateObjectMapId = df.blankNode();
    const predicateMapId = df.blankNode();
    const objectMapId = df.blankNode();
    const expectedStore = new QuadStore();
    expectedStore.addQuads([
      df.quad(triplesMapId, ns.rdf('type'), ns.rml('TriplesMap')),
      df.quad(triplesMapId, ns.rml('subjectMap'), subjectMapId),
      df.quad(
        subjectMapId,
        ns.rml('template'),
        df.literal('https://data.vlaanderen.be/id/DomainClassLabel/{id}'),
      ),
      df.quad(
        subjectMapId,
        ns.rml('class'),
        df.namedNode('http://example.org/id/class/2'),
      ),
      df.quad(triplesMapId, ns.rml('predicateObjectMap'), predicateObjectMapId),
      df.quad(predicateObjectMapId, ns.rml('predicateMap'), predicateMapId),
      df.quad(
        predicateMapId,
        ns.rml('predicate'),
        df.namedNode('http://example.org/id/property/1'),
      ),
      df.quad(predicateObjectMapId, ns.rml('objectMap'), objectMapId),
      df.quad(
        objectMapId,
        ns.rml('template'),
        df.literal('https://data.vlaanderen.be/id/DatatypeClassLabel/{id}'),
      ),
      df.quad(objectMapId, ns.rml('language'), ns.rdf('nl')),
    ]);

    const objectId = df.blankNode();
    await service.store.addQuads(await parseJsonld(RmlLangStringMockData));
    await service.run();

    expect(service.rmlStore === expectedStore);
  });

  it('should generate a valid RML mapping (xsd:integer)', async () => {
    const triplesMapId = df.blankNode();
    const subjectMapId = df.blankNode();
    const predicateObjectMapId = df.blankNode();
    const predicateMapId = df.blankNode();
    const objectMapId = df.blankNode();
    const expectedStore = new QuadStore();
    expectedStore.addQuads([
      df.quad(triplesMapId, ns.rdf('type'), ns.rml('TriplesMap')),
      df.quad(triplesMapId, ns.rml('subjectMap'), subjectMapId),
      df.quad(
        subjectMapId,
        ns.rml('template'),
        df.literal('https://data.vlaanderen.be/id/DomainClassLabel/{id}'),
      ),
      df.quad(
        subjectMapId,
        ns.rml('class'),
        df.namedNode('http://example.org/id/class/2'),
      ),
      df.quad(triplesMapId, ns.rml('predicateObjectMap'), predicateObjectMapId),
      df.quad(predicateObjectMapId, ns.rml('predicateMap'), predicateMapId),
      df.quad(
        predicateMapId,
        ns.rml('predicate'),
        df.namedNode('http://example.org/id/property/1'),
      ),
      df.quad(predicateObjectMapId, ns.rml('objectMap'), objectMapId),
      df.quad(
        objectMapId,
        ns.rml('template'),
        df.literal('https://data.vlaanderen.be/id/DatatypeClassLabel/{id}'),
      ),
      df.quad(objectMapId, ns.rml('datatype'), ns.xsd('integer')),
    ]);

    const objectId = df.blankNode();
    await service.store.addQuads(await parseJsonld(RmlIntegerMockData));
    await service.run();

    expect(service.rmlStore === expectedStore);
  });

  it('should generate a valid RML mapping (SKOS:Concept as xsd:anyURI)', async () => {
    const triplesMapId = df.blankNode();
    const subjectMapId = df.blankNode();
    const predicateObjectMapId = df.blankNode();
    const predicateMapId = df.blankNode();
    const objectMapId = df.blankNode();
    const expectedStore = new QuadStore();
    expectedStore.addQuads([
      df.quad(triplesMapId, ns.rdf('type'), ns.rml('TriplesMap')),
      df.quad(triplesMapId, ns.rml('subjectMap'), subjectMapId),
      df.quad(
        subjectMapId,
        ns.rml('template'),
        df.literal('https://data.vlaanderen.be/id/DomainClassLabel/{id}'),
      ),
      df.quad(
        subjectMapId,
        ns.rml('class'),
        df.namedNode('http://example.org/id/class/2'),
      ),
      df.quad(triplesMapId, ns.rml('predicateObjectMap'), predicateObjectMapId),
      df.quad(predicateObjectMapId, ns.rml('predicateMap'), predicateMapId),
      df.quad(
        predicateMapId,
        ns.rml('predicate'),
        df.namedNode('http://example.org/id/property/1'),
      ),
      df.quad(predicateObjectMapId, ns.rml('objectMap'), objectMapId),
      df.quad(
        objectMapId,
        ns.rml('template'),
        df.literal('https://data.vlaanderen.be/id/DatatypeClassLabel/{id}'),
      ),
      df.quad(objectMapId, ns.rml('datatype'), ns.xsd('anyURI')),
    ]);

    const objectId = df.blankNode();
    await service.store.addQuads(await parseJsonld(RmlIntegerMockData));
    await service.run();

    expect(service.rmlStore === expectedStore);
  });
});
