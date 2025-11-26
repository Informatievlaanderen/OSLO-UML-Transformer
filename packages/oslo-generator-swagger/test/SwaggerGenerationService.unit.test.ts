/**
 * @group unit
 */
import 'reflect-metadata';
import { unlinkSync, readFileSync } from 'fs';
import { Readable } from 'stream';
import { QuadStore, VoidLogger, OutputFormat } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import rdfParser from 'rdf-parse';
import { SwaggerGenerationService } from '../lib/SwaggerGenerationService';
import { kvsInput, kvsOutput } from './data/mockData';

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

describe('SwaggerGenerationService', () => {
  let store: QuadStore;
  let service: any;
  const df: DataFactory = new DataFactory();
  const logger = new VoidLogger();

  beforeEach(() => {
    store = new QuadStore();
    service = <any>new SwaggerGenerationService(
      logger,
      <any>{
        language: 'nl',
        input: 'data/KVS-Input.json',
        output: 'swagger.json',
        title: 'My Title',
        description: 'My Description',
        contextURL: 'http://example.com/context.jsonld',
        baseURL: 'http://example.com/',
        contactName: 'Contact name',
        contactURL: 'http://example.com/contact/',
        contactEmail: 'Contact e-mail',
        licenseName: 'License name',
        licenseURL: 'http://example.com/license/',
        versionAPI: '1.0.0.',
        versionSwagger: '3.0.4',
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

  it('should generate a valid Swagger API document in JSON', async () => {
    await service.store.addQuads(await parseJsonld(kvsInput));
    await service.run();

    const swagger = JSON.parse(readFileSync('swagger.json').toString());
    expect(JSON.stringify(kvsOutput) === JSON.stringify(swagger));
    unlinkSync('swagger.json');
  });
});
