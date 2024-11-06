/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @group unit
 */
import 'reflect-metadata';
import fs from 'fs/promises';
import { QuadStore, VoidLogger } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import rdfParser from 'rdf-parse';
import type { 
	JsonWebuniversumGenerationServiceConfiguration, 
} from '../lib/config/JsonWebuniversumGenerationServiceConfiguration';
import { JsonWebuniversumGenerationService } from '../lib/JsonWebuniversumGenerationService';
import {
  classWithParent,
  classWithParentWithoutAssignedURI,
  classWithProperty,
  classWithPropertyWithoutRange,
  classWithPropertyWithoutRangeAssignedURI,
  classWithoutAssignedURI,
  dataWithRangeCodelist,
  dataWithoutPackage,
  dataWithoutPackageBaseURI,
  jsonldClass,
  packageSubject,
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
    rdfParser
      .parse(textStream, { contentType: 'application/ld+json' })
      .on('data', (quad: RDF.Quad) => quads.push(quad))
      .on('error', (error: unknown) => reject(error))
      .on('end', () => resolve(quads));
  });
}

describe('JsonWebuniversumGenerationServiceConfiguration', () => {
  let store: QuadStore;
  const df: DataFactory = new DataFactory();
  const logger = new VoidLogger();
  let service: JsonWebuniversumGenerationService;

  beforeEach(() => {
    store = new QuadStore();
    service = new JsonWebuniversumGenerationService(
      logger,
      <JsonWebuniversumGenerationServiceConfiguration>{
        language: 'en',
        output: 'config.json',
      },
      store,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize the quad store in the init function', async () => {
    jest.spyOn(store, 'addQuadsFromFile').mockReturnValue(Promise.resolve());
    await service.init();

    expect(store.addQuadsFromFile).toHaveBeenCalled();
  });

  it('should write the JSON Webuniversum config to the output file', async () => {
    store.addQuads(await parseJsonld(jsonldClass));
    jest.spyOn(fs, 'writeFile');
    await service.run();

    expect(fs.writeFile).toHaveBeenCalledWith(
      'config.json',
      JSON.stringify(
        {
          baseURI: 'http://example.org/ns/domain#',
          classes: [
            {
              id: 'http://example.org/id/class/1',
              vocabularyLabel: {
                en: 'VocTestClass',
              },
              applicationProfileLabel: {
                en: 'ApTestClass',
              },
              vocabularyDefinition: {
                en: 'VocDefinition',
              },
              applicationProfileDefinition: {
                en: 'ApDefinition',
              },
              vocabularyUsageNote: {
                en: 'VocUsageNote',
              },
              applicationProfileUsageNote: {
                en: 'ApUsageNote',
              },
            },
          ],
          dataTypes: [
            {
              id: 'http://example.org/id/datatype/1',
              vocabularyLabel: {
                en: 'VocDatatype',
              },
              applicationProfileLabel: {
                en: 'ApDatatype',
              },
              vocabularyDefinition: {
                en: 'VocDatatypeDefinition',
              },
              applicationProfileDefinition: {
                en: 'ApDatatypeDefinition',
              },
              vocabularyUsageNote: {
                en: 'VocDatatypeUsageNote',
              },
              applicationProfileUsageNote: {
                en: 'ApDatatypeUsageNote',
              },
            },
          ],
          properties: [],
        },
        null,
        2,
      ),
      'utf-8',
    );
  });

  it('should throw an error when the package subject is not found', async () => {
    store.addQuads(await parseJsonld(dataWithoutPackage));

    expect(() => (<any>service).getBaseURI()).toThrow(
      new Error('Unable to find the subject for the package.'),
    );
  });

  it('should throw an error when the baseURI is not found', async () => {
    store.addQuads(await parseJsonld(dataWithoutPackageBaseURI));

    expect(() => (<any>service).getBaseURI()).toThrow(
      new Error('Unable to find the baseURI for the package.'),
    );
  });

  it('should throw an error when an assigned URI is not found', async () => {
    store.addQuads(await parseJsonld(classWithoutAssignedURI));

    await expect(() =>
      (<any>service).generateEntityData(
        df.namedNode('http://example.org/id/class/1'),
      ),
    ).rejects.toThrow(
      new Error(
        'Unable to find the assigned URI for entity http://example.org/id/class/1.',
      ),
    );
  });

  it('should include properties into a WebuniversumObject if present', async () => {
    store.addQuads(await parseJsonld(classWithProperty));
	store.addQuads(await parseJsonld(packageSubject));
    const entityData = await (<any>service).generateEntityData(
      df.namedNode('http://example.org/.well-known/id/class/1'),
    );

    expect(entityData.properties).toHaveLength(1);
    expect(entityData.properties).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'http://example.org/id/property/1',
          applicationProfileLabel: {
            en: 'TestProperty',
          },
          domain: 'http://example.org/id/class/1',
          range: {
            id: 'http://example.org/id/class/2',
            listedInDocument: false,
            vocabularyLabel: {
              en: 'VocAnotherTestClass',
            },
            applicationProfileLabel: {
              en: 'ApAnotherTestClass',
            },
          },
          codelist: 'http://example.org/codelist/1',
        }),
      ]),
    );
  });

  it("should throw an error when the a property's range can not be found", async () => {
    store.addQuads(await parseJsonld(classWithPropertyWithoutRange));

    await expect(() =>
      (<any>service).generateEntityData(
        df.namedNode('http://example.org/.well-known/id/class/1'),
      ),
    ).rejects.toThrow(
      new Error(
        `No range found for class http://example.org/.well-known/id/property/1.`,
      ),
    );
  });

  it("should throw an error when the assigned URI of a property's range can not be found", async () => {
    store.addQuads(await parseJsonld(classWithPropertyWithoutRangeAssignedURI));

    await expect(() =>
      (<any>service).generateEntityData(
        df.namedNode('http://example.org/.well-known/id/class/1'),
      ),
    ).rejects.toThrow(
      new Error(
        `Unable to find the assigned URI for range http://example.org/.well-known/id/class/2 of attribute http://example.org/.well-known/id/property/1.`,
      ),
    );
  });

  it('should add parent information if it is present in the QuadStore', async () => {
    store.addQuads(await parseJsonld(classWithParent));
    const parentObject = (<any>service).createParentObject(
      df.namedNode('http://example.org/.well-known/id/class/1'),
    );

    expect(parentObject).toEqual({
      id: 'http://example.org/id/class/1',
      applicationProfileLabel: { en: 'TestClass' },
    });
  });

  it('should throw an error when the assigned URI of a parent can not be found', async () => {
    store.addQuads(await parseJsonld(classWithParentWithoutAssignedURI));

    expect(() =>
      (<any>service).createParentObject(
        df.namedNode('http://example.org/.well-known/id/class/1'),
      ),
    ).toThrow(
      new Error(
        `Unable to find the assigned URI for class http://example.org/.well-known/id/class/1 which acts as a parent.`,
      ),
    );
  });

  it('should check for a codelist by the range if the range is a skos:Concept', async () => {
    store.addQuads(await parseJsonld(dataWithRangeCodelist));
	store.addQuads(await parseJsonld(packageSubject));
    const propertyObject = {};
    (<any>service).addPropertySpecificInformation(
      df.namedNode('http://example.org/.well-known/id/property/1'),
      propertyObject,
      df.namedNode('http://example.org/.well-known/id/class/1'),
    );

    expect(propertyObject).toHaveProperty(
      'codelist',
      'http://example.org/codelist/1',
    );
  });
});
