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
import { MarkdownGenerationService } from '../lib/MarkdownGenerationService';

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

describe('MarkdownGenerationService', () => {
  let store: QuadStore;
  let service: any;
  const df: DataFactory = new DataFactory();
  const logger = new VoidLogger();

  beforeEach(() => {
    store = new QuadStore();
    service = <any>new MarkdownGenerationService(
      logger,
      <any>{
        language: 'nl',
        input: 'test/data/input.jsonld',
        output: 'testoutput',
        baseURI: 'https://data.vlaanderen.be'
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

  it('should generate valid markdown', async () => {
    const mockInput = JSON.parse(readFileSync( 'test/data/input.jsonld', 'utf8'));
    const expectedOutput = readFileSync( 'test/data/expected.md', 'utf8');
    await service.store.addQuads(await parseJsonld(mockInput));
    await service.run();

    const output = readFileSync( 'testoutput/markdown.md', 'utf8');
    expect(output).toBe(expectedOutput);

    rmSync('testoutput', { recursive: true, force: true });
  });
});
