/**
 * @group unit
 */
import 'reflect-metadata';
import type { Logger } from '@oslo-flanders/core';
import { VoidLogger, QuadStore } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { ShaclTemplateGenerationServiceConfiguration } from '../lib/config/ShaclTemplateGenerationServiceConfiguration';
import { UniqueLanguageConstraintHandler } from '../lib/handlers/UniqueLanguageConstraintHandler';
import { TranslationService } from '../lib/TranslationService';
import type { NamedOrBlankNode } from '../lib/types/IHandler';
import {
  baseData,
  dataWithoutLabel,
  dataWithoutRange,
  dataWithoutRangeAssignedURI,
} from './data/uniqueLanguageConstraintHandlerMockData';
import { parseJsonld } from './test-utils';

describe('UniqueLanguageConstraintHandler', () => {
  const logger: Logger = new VoidLogger();
  const df: DataFactory = new DataFactory();
  const translationService: TranslationService = new TranslationService(logger);

  let handler: UniqueLanguageConstraintHandler;
  let store: QuadStore;
  let shaclStore: QuadStore;
  let config: ShaclTemplateGenerationServiceConfiguration;
  let params: any;

  const propertyIdToShapeIdMap = new Map<string, NamedOrBlankNode>([
    ['http://example.org/.well-known/id/property/1', df.namedNode('http://example.org/id/property/shape/1')],
  ]);

  beforeEach(async () => {
    store = new QuadStore();
    shaclStore = new QuadStore();

    // Base information needed for the tests
    shaclStore.addQuads([
      df.quad(
        df.namedNode('http://example.org/id/property/shape/1'),
        df.namedNode('http://www.w3.org/ns/shacl#property'),
        df.namedNode('http://example.org/id/property/1'),
        df.namedNode('baseQuadsGraph'),
      ),
      df.quad(
        df.namedNode('http://example.org/id/property/shape/1'),
        df.namedNode('http://www.w3.org/ns/shacl#class'),
        df.namedNode('http://example.org/id/class/1'),
        df.namedNode('baseQuadsGraph'),
      ),
    ]);

    config = new ShaclTemplateGenerationServiceConfiguration();

    params = {
      mode: 'individual',
      language: 'nl',
      constraint: [],
      addRuleNumbers: false,
      addConstraintMessages: false,
    }
    await config.createFromCli(params);

    handler = new UniqueLanguageConstraintHandler(config, logger, translationService);
    (<any>handler).propertyIdToShapeIdMap = propertyIdToShapeIdMap;
  })

  it('should add a unique language constraint in grouped mode', async () => {
    store.addQuads(await parseJsonld(baseData));
    params.mode = 'grouped';
    await config.createFromCli(params);

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);
    const quads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    expect(quads.some(quad =>
      quad.predicate.equals(df.namedNode('http://www.w3.org/ns/shacl#uniqueLang')) &&
      quad.object.equals(df.literal('true', df.namedNode('http://www.w3.org/2001/XMLSchema#boolean')))))
      .toBe(true);
  });

  it('should add a unique language constraint in individual mode', async () => {
    store.addQuads(await parseJsonld(baseData));

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);
    const quads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    expect(quads.some(quad =>
      quad.predicate.equals(df.namedNode('http://www.w3.org/ns/shacl#uniqueLang')) &&
      quad.subject.equals(df.namedNode('http://example.org/id/property/shape/1-UniqueLangConstraint')) &&
      quad.object.equals(df.literal('true', df.namedNode('http://www.w3.org/2001/XMLSchema#boolean')))))
      .toBe(true);
  });

  it('should throw an error when the range is not found', async () => {
    store.addQuads(await parseJsonld(dataWithoutRange));

    expect(() => handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore))
      .toThrow(new Error('Unable to find the range for subject "http://example.org/.well-known/id/property/1".'))
  })

  it('should throw an error when the assigned URI for the range is not found', async () => {
    store.addQuads(await parseJsonld(dataWithoutRangeAssignedURI));

    expect(() => handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore))
      .toThrow(new Error('Unable to find the assigned URI for range "http://example.org/.well-known/id/class/1".'))
  })

  it('should add a constraint message when the configuration is set to do so', async () => {
    store.addQuads(await parseJsonld(baseData));
    params.addConstraintMessages = true;
    await config.createFromCli(params);

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);
    const quads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    expect(quads.some(quad =>
      quad.predicate.equals(df.namedNode('https://data.vlaanderen.be/ns/shacl#message')) &&
      quad.object.equals(df.literal('Slechts 1 waarde voor elke taal toegelaten voor "Property label".'))))
      .toBe(true);
  })

  it('should throw an error when the label can not be found', async () => {
    store.addQuads(await parseJsonld(dataWithoutLabel));
    params.addConstraintMessages = true;
    await config.createFromCli(params);

    expect(() => handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore))
      .toThrow(new Error('Unable to find the label for subject "http://example.org/.well-known/id/property/1".'));
  })
})