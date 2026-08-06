/**
 * @group unit
 */
import 'reflect-metadata';
import { rmSync, readFileSync, existsSync } from 'fs';
import { Readable } from 'stream';
import { QuadStore, VoidLogger, OutputFormat } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { rdfParser } from 'rdf-parse';
import * as yaml from 'js-yaml';
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
        output: 'output',
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
        outputFormat: [OutputFormat.Json],
        excludeClasses: ['Domicilie'],
        excludeProperties: [
          'GeregistreerdeOrganisatie.voorkeursnaam',
          'PubliekeOrganisatie.voorkeursnaam',
        ],
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

  // Cleanup of generated assets based on mock data.
  afterAll(() => {
    rmSync('output', { recursive: true, force: true });
  });

  it('should initialize the quad store in the init function', async () => {
    jest.spyOn(store, 'addQuadsFromFile').mockReturnValue(Promise.resolve());
    await service.init();

    expect(store.addQuadsFromFile).toHaveBeenCalled();
  });

  it('should generate a valid Swagger API document in JSON', async () => {
    await service.store.addQuads(await parseJsonld(kvsInput));
    await service.run();

    const swagger = JSON.parse(
      readFileSync('output/swagger/example.json').toString(),
    );

    // Excluded class
    expect(swagger.components.schemas.Domicilie).toBeUndefined();
    expect(swagger.components.schemas.GeregistreerdPersoon).toBeDefined();
    expect(JSON.stringify(kvsOutput) === JSON.stringify(swagger));
  });

  it('should generate a valid Swagger API document in JSON and exclude the defined properties', async () => {
    await service.store.addQuads(await parseJsonld(kvsInput));
    await service.run();

    const swagger = JSON.parse(
      readFileSync('output/swagger/example.json').toString(),
    );

    console.log(
      swagger.components.schemas.GeregistreerdeOrganisatie.properties,
    );

    expect(
      swagger.components.schemas.GeregistreerdeOrganisatie.properties
        .voorkeursnaam,
    ).toBeUndefined();
    expect(
      swagger.components.schemas.PubliekeOrganisatie.properties.voorkeursnaam,
    ).toBeUndefined();
    expect(
      swagger.components.schemas.GeregistreerdeOrganisatie.properties
        .contactinfo,
    ).toBeDefined();
  });

  it('should generate a valid Swagger API document in YAML when outputFormat is application/yaml', async () => {
    const yamlService = <any>new SwaggerGenerationService(
      logger,
      <any>{
        language: 'nl',
        input: 'data/KVS-Input.json',
        output: 'output-yaml',
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
        outputFormat: [OutputFormat.Yaml],
        excludeClasses: [],
        excludeProperties: [],
      },
      store,
    );

    await yamlService.store.addQuads(await parseJsonld(kvsInput));
    await yamlService.run();

    // Verify YAML files exist instead of JSON
    expect(existsSync('output-yaml/swagger/example.yaml')).toBe(true);
    expect(existsSync('output-yaml/swagger/components.yaml')).toBe(true);

    // Verify the YAML is valid and matches expected structure
    const yamlContent = readFileSync('output-yaml/swagger/example.yaml').toString();
    const swagger = yaml.load(yamlContent) as any;

    expect(swagger.openapi).toBe('3.0.4');
    expect(swagger.info.title).toBe('My Title');
    expect(swagger.components.schemas.GeregistreerdPersoon).toBeDefined();

    // Cleanup
    rmSync('output-yaml', { recursive: true, force: true });
  });

  it('should generate both JSON and YAML output when both formats are specified', async () => {
    const multiService = <any>new SwaggerGenerationService(
      logger,
      <any>{
        language: 'nl',
        input: 'data/KVS-Input.json',
        output: 'output-both',
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
        outputFormat: [OutputFormat.Json, OutputFormat.Yaml],
        excludeClasses: [],
        excludeProperties: [],
      },
      store,
    );

    await multiService.store.addQuads(await parseJsonld(kvsInput));
    await multiService.run();

    // Verify both JSON and YAML files exist
    expect(existsSync('output-both/swagger/example.json')).toBe(true);
    expect(existsSync('output-both/swagger/components.json')).toBe(true);
    expect(existsSync('output-both/swagger/example.yaml')).toBe(true);
    expect(existsSync('output-both/swagger/components.yaml')).toBe(true);

    // Verify JSON content
    const jsonContent = readFileSync('output-both/swagger/example.json').toString();
    const jsonSwagger = JSON.parse(jsonContent);
    expect(jsonSwagger.openapi).toBe('3.0.4');
    expect(jsonSwagger.info.title).toBe('My Title');

    // Verify YAML content
    const yamlContent = readFileSync('output-both/swagger/example.yaml').toString();
    const yamlSwagger = yaml.load(yamlContent) as any;
    expect(yamlSwagger.openapi).toBe('3.0.4');
    expect(yamlSwagger.info.title).toBe('My Title');

    // Cleanup
    rmSync('output-both', { recursive: true, force: true });
  });
});
