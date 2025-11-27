/**
 * @group unit
 */
import 'reflect-metadata';
import { unlinkSync, rmSync, readFileSync } from 'fs';
import { Readable } from 'stream';
import { QuadStore, VoidLogger, OutputFormat } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import rdfParser from 'rdf-parse';
import { SparqlGenerationService } from '../lib/SparqlGenerationService';
import { mockInput, mockSparqlParticipatie, mockSparqlAdresvoorstelling } from './data/mockData';

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

describe('SparqlGenerationService', () => {
  let store: QuadStore;
  let service: any;
  const df: DataFactory = new DataFactory();
  const logger = new VoidLogger();

  beforeEach(() => {
    store = new QuadStore();
    service = <any>new SparqlGenerationService(
      logger,
      <any>{
        language: 'nl',
        input: 'input.jsonld',
        output: 'queriesDirectory',
        versionSPARQL: '1.1',
      },
      store,
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

  it('should generate a valid SPARQL query', async () => {
    await service.store.addQuads(await parseJsonld(mockInput));
    await service.run();

    const sparqlParticipatie = readFileSync('queriesDirectory/Participatie.sparql', 'utf8');
    expect(sparqlParticipatie).toBe(mockSparqlParticipatie);
    unlinkSync('queriesDirectory/Participatie.sparql');

    const sparqlAdresvoorstelling = readFileSync('queriesDirectory/Adresvoorstelling.sparql', 'utf8');
    expect(sparqlAdresvoorstelling).toBe(mockSparqlAdresvoorstelling);
    unlinkSync('queriesDirectory/Adresvoorstelling.sparql');

    rmSync('queriesDirectory', { recursive: true, force: true });
  });
});
