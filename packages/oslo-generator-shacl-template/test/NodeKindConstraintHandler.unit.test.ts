/**
 * @group unit
 */
import 'reflect-metadata';
import type { Logger } from '@oslo-flanders/core';
import { QuadStore, VoidLogger } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { ShaclTemplateGenerationServiceConfiguration }
  from '../lib/config/ShaclTemplateGenerationServiceConfiguration';
import { NodeKindConstraintHandler } from '../lib/handlers/NodeKindConstraintHandler';
import { TranslationService } from '../lib/TranslationService';
import type { NamedOrBlankNode } from '../lib/types/IHandler';
import { baseData, dataWithoutLabel, dataWithoutType } from './data/nodeKindConstraintHandlerMockData';
import { parseJsonld } from './util';

describe('NodeKindConstraintHandler', () => {
  const logger: Logger = new VoidLogger();
  const df: DataFactory = new DataFactory();
  const translationService: TranslationService = new TranslationService(logger);

  let handler: NodeKindConstraintHandler;
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
    handler = new NodeKindConstraintHandler(config, logger, translationService);

    (<any>handler).propertyIdToShapeIdMap = propertyIdToShapeIdMap;
  });

  it('should add a node kind constraint in grouped mode', async () => {
    store.addQuads(await parseJsonld(baseData))
    params.mode = 'grouped';
    await config.createFromCli(params);

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);

    const quads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    expect(quads.some(quad => quad.predicate.equals(df.namedNode('http://www.w3.org/ns/shacl#nodeKind'))))
      .toBe(true);
  });

  it('should add a node kind constraint in individual mode', async () => {
    store.addQuads(await parseJsonld(baseData))

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);
    const quads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    expect(quads.some((quad: RDF.Quad) =>
      quad.predicate.equals(df.namedNode('http://www.w3.org/ns/shacl#nodeKind')) &&
      quad.subject.equals(df.namedNode('http://example.org/id/property/shape/1-NodeKindConstraint'))))
      .toBe(true);
  });

  it('should throw an error when the property type can not be found', async () => {
    store.addQuads(await parseJsonld(dataWithoutType));

    expect(() => handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore))
      .toThrow(new Error(`Unable to find the type for subject "http://example.org/.well-known/id/property/1".`))
  });

  it('should throw an error when the label can not be found', async () => {
    store.addQuads(await parseJsonld(dataWithoutLabel));
    params.addConstraintMessages = true;
    await config.createFromCli(params);

    expect(() => handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore))
      .toThrow(new Error(`Unable to find the label for subject "http://example.org/.well-known/id/property/1".`))
  })

  it('should add a constraint message when set through configuration', async () => {
    store.addQuads(await parseJsonld(baseData));
    params.addConstraintMessages = true;
    await config.createFromCli(params);

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);
    const quads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    expect(quads.some((quad: RDF.Quad) =>
      quad.predicate.equals(df.namedNode('https://data.vlaanderen.be/ns/shacl#message')) &&
      quad.object.value === 'De verwachte waarde voor "Property label" is een rdfs:Resource (URI of blank node).'))
      .toBe(true);
  });
});