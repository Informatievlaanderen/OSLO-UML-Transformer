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

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  readFileSync: jest.fn().mockReturnValue('{}'),
}));

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
    mapping: 'mapping.json',
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
    const triplesMapId = df.blankNode('_:TM.DatatypeClassLabel');
    const triplesMap2Id = df.blankNode('_:TM.DomainClassLabel');
    const subjectMapId = df.blankNode('_:SM.DatatypeClassLabel');
    const subjectMap2Id = df.blankNode('_:SM.DomainClassLabel');
    const logicalSourceId = df.blankNode('_:LS.DatatypeClassLabel');
    const sourceId = df.blankNode('_:S.DatatypeClassLabel');
    const logicalSource2Id = df.blankNode('_:LS.DomainClassLabel');
    const source2Id = df.blankNode('_:S.DomainClassLabel');
    const predicateObjectMap2Id = df.blankNode(
      '_:POM.DomainClassLabel.propertyLabel',
    );
    const predicateMap2Id = df.blankNode('_:PM.DomainClassLabel.propertyLabel');
    const objectMap2Id = df.blankNode('_:OM.DomainClassLabel.propertyLabel');
    const expectedStore = new QuadStore();
    expectedStore.addQuads([
      df.quad(triplesMapId, ns.rdf('type'), ns.rml('TriplesMap')),
      df.quad(
        triplesMapId,
        ns.rdfs('label'),
        df.literal('TriplesMapDatatypeClassLabel'),
      ),
      df.quad(triplesMapId, ns.rml('subjectMap'), subjectMapId),
      df.quad(
        subjectMapId,
        ns.rml('template'),
        df.literal('$DatatypeClassLabel'),
      ),
      df.quad(
        subjectMapId,
        ns.rml('class'),
        df.namedNode('http://example.org/id/class/1'),
      ),
      df.quad(subjectMapId, ns.rdf('type'), ns.rml('SubjectMap')),
      df.quad(logicalSourceId, ns.rdf('type'), ns.rml('LogicalSource')),
      df.quad(logicalSourceId, ns.rml('source'), sourceId),
      df.quad(sourceId, ns.rdf('type'), ns.rml('Source')),
      df.quad(sourceId, ns.rdf('type'), ns.rml('FilePath')),
      df.quad(sourceId, ns.rml('path'), df.literal('test.csv')),
      df.quad(sourceId, ns.rml('root'), ns.rml('CurrentWorkingDirectory')),
      df.quad(logicalSourceId, ns.rml('referenceFormulation'), ns.rml('CSV')),
      df.quad(logicalSource2Id, ns.rdf('type'), ns.rml('LogicalSource')),
      df.quad(logicalSource2Id, ns.rml('source'), source2Id),
      df.quad(logicalSource2Id, ns.rml('referenceFormulation'), ns.rml('CSV')),
      df.quad(source2Id, ns.rdf('type'), ns.rml('Source')),
      df.quad(source2Id, ns.rdf('type'), ns.rml('FilePath')),
      df.quad(source2Id, ns.rml('path'), df.literal('test.csv')),
      df.quad(source2Id, ns.rml('root'), ns.rml('CurrentWorkingDirectory')),
      df.quad(triplesMap2Id, ns.rdf('type'), ns.rml('TriplesMap')),
      df.quad(
        triplesMap2Id,
        ns.rdfs('label'),
        df.literal('TriplesMapDomainClassLabel'),
      ),
      df.quad(triplesMap2Id, ns.rml('logicalSource'), logicalSource2Id),
      df.quad(triplesMapId, ns.rml('logicalSource'), logicalSourceId),
      df.quad(triplesMap2Id, ns.rml('subjectMap'), subjectMap2Id),
      df.quad(
        subjectMap2Id,
        ns.rml('template'),
        df.literal('$DomainClassLabel'),
      ),
      df.quad(
        subjectMap2Id,
        ns.rml('class'),
        df.namedNode('http://example.org/id/class/2'),
      ),
      df.quad(subjectMap2Id, ns.rdf('type'), ns.rml('SubjectMap')),
      df.quad(
        triplesMap2Id,
        ns.rml('predicateObjectMap'),
        predicateObjectMap2Id,
      ),
      df.quad(
        predicateObjectMap2Id,
        ns.rdf('type'),
        ns.rml('PredicateObjectMap'),
      ),
      df.quad(predicateObjectMap2Id, ns.rml('predicateMap'), predicateMap2Id),
      df.quad(predicateMap2Id, ns.rdf('type'), ns.rml('PredicateMap')),
      df.quad(
        predicateMap2Id,
        ns.rml('predicate'),
        df.namedNode('http://example.org/id/property/1'),
      ),
      df.quad(predicateObjectMap2Id, ns.rml('objectMap'), objectMap2Id),
      df.quad(objectMap2Id, ns.rdf('type'), ns.rml('ObjectMap')),
      df.quad(
        objectMap2Id,
        ns.rml('template'),
        df.literal('$DomainClassLabel.propertyLabel'),
      ),
      df.quad(objectMap2Id, ns.rml('termType'), ns.rml('IRI')),
    ]);

    const objectId = df.blankNode();
    await service.store.addQuads(await parseJsonld(RmlClassJoinMockData));
    await service.run();

    expect(areStoresEqual(service.rmlStore, expectedStore)).toBe(true);
  });

  it('should generate a valid RML mapping (rdf:LangString)', async () => {
    const triplesMap2Id = df.blankNode('_:TM.DomainClassLabel');
    const subjectMap2Id = df.blankNode('_:SM.DomainClassLabel');
    const logicalSource2Id = df.blankNode('_:LS.DomainClassLabel');
    const source2Id = df.blankNode('_:S.DomainClassLabel');
    const predicateObjectMap2Id = df.blankNode(
      '_:POM.DomainClassLabel.propertyLabel',
    );
    const predicateMap2Id = df.blankNode('_:PM.DomainClassLabel.propertyLabel');
    const objectMap2Id = df.blankNode('_:OM.DomainClassLabel.propertyLabel');
    const expectedStore = new QuadStore();
    expectedStore.addQuads([
      df.quad(logicalSource2Id, ns.rdf('type'), ns.rml('LogicalSource')),
      df.quad(logicalSource2Id, ns.rml('source'), source2Id),
      df.quad(logicalSource2Id, ns.rml('referenceFormulation'), ns.rml('CSV')),
      df.quad(source2Id, ns.rdf('type'), ns.rml('Source')),
      df.quad(source2Id, ns.rdf('type'), ns.rml('FilePath')),
      df.quad(source2Id, ns.rml('path'), df.literal('test.csv')),
      df.quad(source2Id, ns.rml('root'), ns.rml('CurrentWorkingDirectory')),
      df.quad(triplesMap2Id, ns.rdf('type'), ns.rml('TriplesMap')),
      df.quad(
        triplesMap2Id,
        ns.rdfs('label'),
        df.literal('TriplesMapDomainClassLabel'),
      ),
      df.quad(triplesMap2Id, ns.rml('subjectMap'), subjectMap2Id),
      df.quad(
        subjectMap2Id,
        ns.rml('template'),
        df.literal('$DomainClassLabel'),
      ),
      df.quad(
        subjectMap2Id,
        ns.rml('class'),
        df.namedNode('http://example.org/id/class/2'),
      ),
      df.quad(subjectMap2Id, ns.rdf('type'), ns.rml('SubjectMap')),
      df.quad(triplesMap2Id, ns.rml('logicalSource'), logicalSource2Id),
      df.quad(
        triplesMap2Id,
        ns.rml('predicateObjectMap'),
        predicateObjectMap2Id,
      ),
      df.quad(
        predicateObjectMap2Id,
        ns.rdf('type'),
        ns.rml('PredicateObjectMap'),
      ),
      df.quad(predicateObjectMap2Id, ns.rml('predicateMap'), predicateMap2Id),
      df.quad(predicateMap2Id, ns.rdf('type'), ns.rml('PredicateMap')),
      df.quad(
        predicateMap2Id,
        ns.rml('predicate'),
        df.namedNode('http://example.org/id/property/1'),
      ),
      df.quad(predicateObjectMap2Id, ns.rml('objectMap'), objectMap2Id),
      df.quad(objectMap2Id, ns.rdf('type'), ns.rml('ObjectMap')),
      df.quad(
        objectMap2Id,
        ns.rml('reference'),
        df.literal('$DomainClassLabel.propertyLabel'),
      ),
      df.quad(objectMap2Id, ns.rml('language'), df.literal('nl')),
      df.quad(objectMap2Id, ns.rml('termType'), ns.rml('Literal')),
    ]);

    const objectId = df.blankNode();
    await service.store.addQuads(await parseJsonld(RmlLangStringMockData));
    await service.run();

    expect(areStoresEqual(service.rmlStore, expectedStore)).toBe(true);
  });

  it('should generate a valid RML mapping (xsd:integer)', async () => {
    const triplesMap2Id = df.blankNode('_:TM.DomainClassLabel');
    const subjectMap2Id = df.blankNode('_:SM.DomainClassLabel');
    const logicalSource2Id = df.blankNode('_:LS.DomainClassLabel');
    const source2Id = df.blankNode('_:S.DomainClassLabel');
    const predicateObjectMap2Id = df.blankNode(
      '_:POM.DomainClassLabel.propertyLabel',
    );
    const predicateMap2Id = df.blankNode('_:PM.DomainClassLabel.propertyLabel');
    const objectMap2Id = df.blankNode('_:OM.DomainClassLabel.propertyLabel');
    const expectedStore = new QuadStore();
    expectedStore.addQuads([
      df.quad(logicalSource2Id, ns.rdf('type'), ns.rml('LogicalSource')),
      df.quad(logicalSource2Id, ns.rml('source'), source2Id),
      df.quad(logicalSource2Id, ns.rml('referenceFormulation'), ns.rml('CSV')),
      df.quad(source2Id, ns.rdf('type'), ns.rml('Source')),
      df.quad(source2Id, ns.rdf('type'), ns.rml('FilePath')),
      df.quad(source2Id, ns.rml('path'), df.literal('test.csv')),
      df.quad(source2Id, ns.rml('root'), ns.rml('CurrentWorkingDirectory')),
      df.quad(triplesMap2Id, ns.rdf('type'), ns.rml('TriplesMap')),
      df.quad(
        triplesMap2Id,
        ns.rdfs('label'),
        df.literal('TriplesMapDomainClassLabel'),
      ),
      df.quad(triplesMap2Id, ns.rml('subjectMap'), subjectMap2Id),
      df.quad(
        subjectMap2Id,
        ns.rml('template'),
        df.literal('$DomainClassLabel'),
      ),
      df.quad(
        subjectMap2Id,
        ns.rml('class'),
        df.namedNode('http://example.org/id/class/2'),
      ),
      df.quad(subjectMap2Id, ns.rdf('type'), ns.rml('SubjectMap')),
      df.quad(triplesMap2Id, ns.rml('logicalSource'), logicalSource2Id),
      df.quad(
        triplesMap2Id,
        ns.rml('predicateObjectMap'),
        predicateObjectMap2Id,
      ),
      df.quad(
        predicateObjectMap2Id,
        ns.rdf('type'),
        ns.rml('PredicateObjectMap'),
      ),
      df.quad(predicateObjectMap2Id, ns.rml('predicateMap'), predicateMap2Id),
      df.quad(predicateMap2Id, ns.rdf('type'), ns.rml('PredicateMap')),
      df.quad(
        predicateMap2Id,
        ns.rml('predicate'),
        df.namedNode('http://example.org/id/property/1'),
      ),
      df.quad(predicateObjectMap2Id, ns.rml('objectMap'), objectMap2Id),
      df.quad(objectMap2Id, ns.rdf('type'), ns.rml('ObjectMap')),
      df.quad(
        objectMap2Id,
        ns.rml('reference'),
        df.literal('$DomainClassLabel.propertyLabel'),
      ),
      df.quad(objectMap2Id, ns.rml('datatype'), ns.xsd('integer')),
      df.quad(objectMap2Id, ns.rml('termType'), ns.rml('Literal')),
    ]);

    await service.store.addQuads(await parseJsonld(RmlIntegerMockData));
    await service.run();

    expect(areStoresEqual(service.rmlStore, expectedStore)).toBe(true);
  });

  it('should generate a valid RML mapping (SKOS:Concept as xsd:anyURI)', async () => {
    const triplesMapId = df.blankNode('_:TM.SKOSConceptLabel');
    const triplesMap2Id = df.blankNode('_:TM.DomainClassLabel');
    const subjectMapId = df.blankNode('_:SM.SKOSConceptLabel');
    const subjectMap2Id = df.blankNode('_:SM.DomainClassLabel');
    const logicalSourceId = df.blankNode('_:LS.SKOSConceptLabel');
    const logicalSource2Id = df.blankNode('_:LS.DomainClassLabel');
    const sourceId = df.blankNode('_:S.SKOSConceptLabel');
    const source2Id = df.blankNode('_:S.DomainClassLabel');
    const predicateObjectMap2Id = df.blankNode(
      '_:POM.DomainClassLabel.propertyConceptURI',
    );
    const predicateMap2Id = df.blankNode(
      '_:PM.DomainClassLabel.propertyConceptURI',
    );
    const objectMap2Id = df.blankNode(
      '_:OM.DomainClassLabel.propertyConceptURI',
    );
    const expectedStore = new QuadStore();
    expectedStore.addQuads([
      df.quad(logicalSourceId, ns.rdf('type'), ns.rml('LogicalSource')),
      df.quad(logicalSourceId, ns.rml('source'), sourceId),
      df.quad(sourceId, ns.rdf('type'), ns.rml('Source')),
      df.quad(sourceId, ns.rdf('type'), ns.rml('FilePath')),
      df.quad(sourceId, ns.rml('path'), df.literal('test.csv')),
      df.quad(sourceId, ns.rml('root'), ns.rml('CurrentWorkingDirectory')),
      df.quad(logicalSourceId, ns.rml('referenceFormulation'), ns.rml('CSV')),
      df.quad(logicalSource2Id, ns.rdf('type'), ns.rml('LogicalSource')),
      df.quad(logicalSource2Id, ns.rml('source'), source2Id),
      df.quad(logicalSource2Id, ns.rml('referenceFormulation'), ns.rml('CSV')),
      df.quad(source2Id, ns.rdf('type'), ns.rml('Source')),
      df.quad(source2Id, ns.rdf('type'), ns.rml('FilePath')),
      df.quad(source2Id, ns.rml('path'), df.literal('test.csv')),
      df.quad(source2Id, ns.rml('root'), ns.rml('CurrentWorkingDirectory')),
      df.quad(triplesMapId, ns.rdf('type'), ns.rml('TriplesMap')),
      df.quad(
        triplesMapId,
        ns.rdfs('label'),
        df.literal('TriplesMapSKOSConceptLabel'),
      ),
      df.quad(triplesMapId, ns.rml('subjectMap'), subjectMapId),
      df.quad(
        subjectMapId,
        ns.rml('template'),
        df.literal('$SKOSConceptLabel'),
      ),
      df.quad(
        subjectMapId,
        ns.rml('class'),
        df.namedNode('http://www.w3.org/2004/02/skos/core#Concept'),
      ),
      df.quad(subjectMapId, ns.rdf('type'), ns.rml('SubjectMap')),
      df.quad(triplesMapId, ns.rml('logicalSource'), logicalSourceId),
      df.quad(triplesMap2Id, ns.rml('logicalSource'), logicalSource2Id),
      df.quad(triplesMap2Id, ns.rdf('type'), ns.rml('TriplesMap')),
      df.quad(
        triplesMap2Id,
        ns.rdfs('label'),
        df.literal('TriplesMapDomainClassLabel'),
      ),
      df.quad(triplesMap2Id, ns.rml('subjectMap'), subjectMap2Id),
      df.quad(
        subjectMap2Id,
        ns.rml('template'),
        df.literal('$DomainClassLabel'),
      ),
      df.quad(
        subjectMap2Id,
        ns.rml('class'),
        df.namedNode('http://example.org/id/class/2'),
      ),
      df.quad(subjectMap2Id, ns.rdf('type'), ns.rml('SubjectMap')),
      df.quad(
        triplesMap2Id,
        ns.rml('predicateObjectMap'),
        predicateObjectMap2Id,
      ),
      df.quad(
        predicateObjectMap2Id,
        ns.rdf('type'),
        ns.rml('PredicateObjectMap'),
      ),
      df.quad(predicateObjectMap2Id, ns.rml('predicateMap'), predicateMap2Id),
      df.quad(predicateMap2Id, ns.rdf('type'), ns.rml('PredicateMap')),
      df.quad(
        predicateMap2Id,
        ns.rml('predicate'),
        df.namedNode('http://example.org/id/property/1'),
      ),
      df.quad(predicateObjectMap2Id, ns.rml('objectMap'), objectMap2Id),
      df.quad(objectMap2Id, ns.rdf('type'), ns.rml('ObjectMap')),
      df.quad(
        objectMap2Id,
        ns.rml('reference'),
        df.literal('$DomainClassLabel.propertyConceptURI'),
      ),
      df.quad(objectMap2Id, ns.rml('termType'), ns.rml('IRI')),
    ]);

    await service.store.addQuads(await parseJsonld(RmlConceptMockData));
    await service.run();

    expect(areStoresEqual(service.rmlStore, expectedStore)).toBe(true);
  });
});
