/**
 * @group unit
 */
import 'reflect-metadata';
import { Readable } from 'stream';
import {
  QuadStore,
  VoidLogger,
  OutputFormat,
  ns,
  areStoresEqual,
} from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import rdfParser from 'rdf-parse';
import { OutputHandlerService } from '../lib/OutputHandlerService';
import { RmlGenerationService } from '../lib/RmlGenerationService';
import { quadSort } from '../lib/utils/utils';
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
    const triplesMapId = df.blankNode('TriplesMapDatatypeClassLabel');
    const triplesMap2Id = df.blankNode('TriplesMapDomainClassLabel');
    const subjectMapId = df.blankNode('SubjectMapDatatypeClassLabel');
    const subjectMap2Id = df.blankNode('SubjectMapDomainClassLabel');
    const predicateObjectMap2Id = df.blankNode('PredicateObjectMapDomainClassLabel.propertyLabel');
    const predicateMap2Id = df.blankNode('PredicateMapDomainClassLabel.propertyLabel');
    const objectMap2Id = df.blankNode('ObjectMapDomainClassLabel.propertyLabel');
    const expectedStore = new QuadStore();
    expectedStore.addQuads([
      df.quad(triplesMapId, ns.rdf('type'), ns.rml('TriplesMap')),
      df.quad(triplesMapId, ns.rdfs('label'), df.literal('TriplesMapDatatypeClassLabel')),
      df.quad(triplesMapId, ns.rml('subjectMap'), subjectMapId),
      df.quad(
        subjectMapId,
        ns.rml('template'),
        df.literal('https://data.vlaanderen.be/id/DatatypeClassLabel/{id}'),
      ),
      df.quad(
        subjectMapId,
        ns.rml('class'),
        df.namedNode('http://example.org/id/class/1'),
      ),
      df.quad(subjectMapId, ns.rdf('type'), ns.rml('SubjectMap')),
      df.quad(triplesMap2Id, ns.rdf('type'), ns.rml('TriplesMap')),
      df.quad(triplesMap2Id, ns.rdfs('label'), df.literal('TriplesMapDomainClassLabel')),
      df.quad(triplesMap2Id, ns.rml('subjectMap'), subjectMap2Id),
      df.quad(
        subjectMap2Id,
        ns.rml('template'),
        df.literal('https://data.vlaanderen.be/id/DomainClassLabel/{id}'),
      ),
      df.quad(
        subjectMap2Id,
        ns.rml('class'),
        df.namedNode('http://example.org/id/class/2'),
      ),
      df.quad(subjectMap2Id, ns.rdf('type'), ns.rml('SubjectMap')),
      df.quad(triplesMap2Id, ns.rml('predicateObjectMap'), predicateObjectMap2Id),
      df.quad(predicateObjectMap2Id, ns.rdf('type'), ns.rml('PredicateObjectMap')),
      df.quad(predicateObjectMap2Id, ns.rml('predicateMap'), predicateMap2Id),
      df.quad(predicateMap2Id, ns.rdf('type'), ns.rml('PredicateMap')),
      df.quad(predicateMap2Id, ns.rml('predicate'), df.namedNode('http://example.org/id/property/1')),
      df.quad(predicateObjectMap2Id, ns.rml('objectMap'), objectMap2Id),
      df.quad(objectMap2Id, ns.rdf('type'), ns.rml('ObjectMap')),
      df.quad(objectMap2Id, ns.rml('template'), df.literal('https://data.vlaanderen.be/id/DatatypeClassLabel/{id}')),
      df.quad(objectMap2Id, ns.rml('termType'), ns.rml('IRI')),
    ]);

    const objectId = df.blankNode();
    await service.store.addQuads(await parseJsonld(RmlClassJoinMockData));
    await service.run();

    expect(areStoresEqual(service.rmlStore, expectedStore)).toBe(true);
  });

  it('should generate a valid RML mapping (rdf:LangString)', async () => {
    const triplesMap2Id = df.blankNode('TriplesMapDomainClassLabel');
    const subjectMap2Id = df.blankNode('SubjectMapDomainClassLabel');
    const predicateObjectMap2Id = df.blankNode('PredicateObjectMapDomainClassLabel.propertyLabel');
    const predicateMap2Id = df.blankNode('PredicateMapDomainClassLabel.propertyLabel');
    const objectMap2Id = df.blankNode('ObjectMapDomainClassLabel.propertyLabel');
    const expectedStore = new QuadStore();
    expectedStore.addQuads([
      df.quad(triplesMap2Id, ns.rdf('type'), ns.rml('TriplesMap')),
      df.quad(triplesMap2Id, ns.rdfs('label'), df.literal('TriplesMapDomainClassLabel')),
      df.quad(triplesMap2Id, ns.rml('subjectMap'), subjectMap2Id),
      df.quad(
        subjectMap2Id,
        ns.rml('template'),
        df.literal('https://data.vlaanderen.be/id/DomainClassLabel/{id}'),
      ),
      df.quad(
        subjectMap2Id,
        ns.rml('class'),
        df.namedNode('http://example.org/id/class/2'),
      ),
      df.quad(subjectMap2Id, ns.rdf('type'), ns.rml('SubjectMap')),
      df.quad(triplesMap2Id, ns.rml('predicateObjectMap'), predicateObjectMap2Id),
      df.quad(predicateObjectMap2Id, ns.rdf('type'), ns.rml('PredicateObjectMap')),
      df.quad(predicateObjectMap2Id, ns.rml('predicateMap'), predicateMap2Id),
      df.quad(predicateMap2Id, ns.rdf('type'), ns.rml('PredicateMap')),
      df.quad(predicateMap2Id, ns.rml('predicate'), df.namedNode('http://example.org/id/property/1')),
      df.quad(predicateObjectMap2Id, ns.rml('objectMap'), objectMap2Id),
      df.quad(objectMap2Id, ns.rdf('type'), ns.rml('ObjectMap')),
      df.quad(objectMap2Id, ns.rml('reference'), df.literal('propertyLabel')),
      df.quad(objectMap2Id, ns.rml('language'), df.literal('nl')),
      df.quad(objectMap2Id, ns.rml('termType'), ns.rml('Literal')),
    ]);

    const objectId = df.blankNode();
    await service.store.addQuads(await parseJsonld(RmlLangStringMockData));
    await service.run();

    expect(areStoresEqual(service.rmlStore, expectedStore)).toBe(true);
  });

  it('should generate a valid RML mapping (xsd:integer)', async () => {
    const triplesMap2Id = df.blankNode('TriplesMapDomainClassLabel');
    const subjectMap2Id = df.blankNode('SubjectMapDomainClassLabel');
    const predicateObjectMap2Id = df.blankNode('PredicateObjectMapDomainClassLabel.propertyLabel');
    const predicateMap2Id = df.blankNode('PredicateMapDomainClassLabel.propertyLabel');
    const objectMap2Id = df.blankNode('ObjectMapDomainClassLabel.propertyLabel');
    const expectedStore = new QuadStore();
    expectedStore.addQuads([
      df.quad(triplesMap2Id, ns.rdf('type'), ns.rml('TriplesMap')),
      df.quad(triplesMap2Id, ns.rdfs('label'), df.literal('TriplesMapDomainClassLabel')),
      df.quad(triplesMap2Id, ns.rml('subjectMap'), subjectMap2Id),
      df.quad(
        subjectMap2Id,
        ns.rml('template'),
        df.literal('https://data.vlaanderen.be/id/DomainClassLabel/{id}'),
      ),
      df.quad(
        subjectMap2Id,
        ns.rml('class'),
        df.namedNode('http://example.org/id/class/2'),
      ),
      df.quad(subjectMap2Id, ns.rdf('type'), ns.rml('SubjectMap')),
      df.quad(triplesMap2Id, ns.rml('predicateObjectMap'), predicateObjectMap2Id),
      df.quad(predicateObjectMap2Id, ns.rdf('type'), ns.rml('PredicateObjectMap')),
      df.quad(predicateObjectMap2Id, ns.rml('predicateMap'), predicateMap2Id),
      df.quad(predicateMap2Id, ns.rdf('type'), ns.rml('PredicateMap')),
      df.quad(predicateMap2Id, ns.rml('predicate'), df.namedNode('http://example.org/id/property/1')),
      df.quad(predicateObjectMap2Id, ns.rml('objectMap'), objectMap2Id),
      df.quad(objectMap2Id, ns.rdf('type'), ns.rml('ObjectMap')),
      df.quad(objectMap2Id, ns.rml('reference'), df.literal('propertyLabel')),
      df.quad(objectMap2Id, ns.rml('datatype'), ns.xsd('integer')),
      df.quad(objectMap2Id, ns.rml('termType'), ns.rml('Literal')),
    ]);

    await service.store.addQuads(await parseJsonld(RmlIntegerMockData));
    await service.run();

    expect(areStoresEqual(service.rmlStore, expectedStore)).toBe(true);
  });

  it('should generate a valid RML mapping (SKOS:Concept as xsd:anyURI)', async () => {
    const triplesMapId = df.blankNode('TriplesMapConceptLabel');
    const triplesMap2Id = df.blankNode('TriplesMapDomainClassLabel');
    const subjectMapId = df.blankNode('SubjectMapConceptLabel');
    const subjectMap2Id = df.blankNode('SubjectMapDomainClassLabel');
    const predicateObjectMap2Id = df.blankNode('PredicateObjectMapDomainClassLabel.propertyConceptURI');
    const predicateMap2Id = df.blankNode('PredicateMapDomainClassLabel.propertyConceptURI');
    const objectMap2Id = df.blankNode('ObjectMapDomainClassLabel.propertyConceptURI');
    const expectedStore = new QuadStore();
    expectedStore.addQuads([
      df.quad(triplesMapId, ns.rdf('type'), ns.rml('TriplesMap')),
      df.quad(triplesMapId, ns.rdfs('label'), df.literal('TriplesMapConceptLabel')),
      df.quad(triplesMapId, ns.rml('subjectMap'), subjectMapId),
      df.quad(
        subjectMapId,
        ns.rml('template'),
        df.literal('https://data.vlaanderen.be/id/ConceptLabel/{id}'),
      ),
      df.quad(
        subjectMapId,
        ns.rml('class'),
        df.namedNode('http://www.w3.org/2004/02/skos/core#Concept'),
      ),
      df.quad(subjectMapId, ns.rdf('type'), ns.rml('SubjectMap')),
      df.quad(triplesMap2Id, ns.rdf('type'), ns.rml('TriplesMap')),
      df.quad(triplesMap2Id, ns.rdfs('label'), df.literal('TriplesMapDomainClassLabel')),
      df.quad(triplesMap2Id, ns.rml('subjectMap'), subjectMap2Id),
      df.quad(
        subjectMap2Id,
        ns.rml('template'),
        df.literal('https://data.vlaanderen.be/id/DomainClassLabel/{id}'),
      ),
      df.quad(
        subjectMap2Id,
        ns.rml('class'),
        df.namedNode('http://example.org/id/class/2'),
      ),
      df.quad(subjectMap2Id, ns.rdf('type'), ns.rml('SubjectMap')),
      df.quad(triplesMap2Id, ns.rml('predicateObjectMap'), predicateObjectMap2Id),
      df.quad(predicateObjectMap2Id, ns.rdf('type'), ns.rml('PredicateObjectMap')),
      df.quad(predicateObjectMap2Id, ns.rml('predicateMap'), predicateMap2Id),
      df.quad(predicateMap2Id, ns.rdf('type'), ns.rml('PredicateMap')),
      df.quad(predicateMap2Id, ns.rml('predicate'), df.namedNode('http://example.org/id/property/1')),
      df.quad(predicateObjectMap2Id, ns.rml('objectMap'), objectMap2Id),
      df.quad(objectMap2Id, ns.rdf('type'), ns.rml('ObjectMap')),
      df.quad(objectMap2Id, ns.rml('reference'), df.literal('propertyConceptURI')),
      df.quad(objectMap2Id, ns.rml('termType'), ns.rml('IRI')),
    ]);


    await service.store.addQuads(await parseJsonld(RmlConceptMockData));
    await service.run();

    expect(areStoresEqual(service.rmlStore, expectedStore)).toBe(true);
  });
});
