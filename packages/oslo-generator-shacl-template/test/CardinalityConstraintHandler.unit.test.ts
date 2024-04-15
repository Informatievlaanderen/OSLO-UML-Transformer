/**
 * @group unit
 */
import 'reflect-metadata';
import type { Logger } from '@oslo-flanders/core';
import { VoidLogger, QuadStore, ns } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { GenerationMode } from '../lib/enums/GenerationMode';
import { CardinalityConstraintHandler } from '../lib/handlers/CardinalityConstraintHandler';
import { TranslationService } from '../lib/TranslationService';
import type { NamedOrBlankNode } from '../lib/types/IHandler';
import { baseData, dataWithoutLabel, nCardinalityConstraint } from './data/cardinalityConstraintHandlerMockData';
import { parseJsonld } from './test-utils';

describe('CardinalityConstraintHandler', () => {
  const logger: Logger = new VoidLogger();
  const df: RDF.DataFactory = new DataFactory();
  const translationService: TranslationService = new TranslationService(logger);

  let store: QuadStore;
  let shaclStore: QuadStore;
  let handler: CardinalityConstraintHandler;
  let config: any;

  const propertyIdToShapeIdMap: Map<string, NamedOrBlankNode> = new Map([
    ['http://example.org/.well-known/id/property/1', df.namedNode('http://example.org/id/property/shape/1')],
  ]);

  beforeEach(() => {
    config = {
      mode: GenerationMode.Grouped,
      language: 'nl',
      addConstraintMessages: false,
    };
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

    handler = new CardinalityConstraintHandler(config, logger, translationService);
    (<any>handler).propertyIdToShapeIdMap = propertyIdToShapeIdMap;
  })

  it('should add cardinality constraints for a property to a quad store in mode grouped', async () => {
    store.addQuads(await parseJsonld(baseData));

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);
    const shaclQuads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    shaclQuads.forEach((quad: RDF.Quad) => {
      expect(quad.subject.equals(df.namedNode('http://example.org/id/property/shape/1'))).toBe(true);
    });
    expect(shaclQuads.some((quad: RDF.Quad) =>
      quad.predicate.equals(ns.shacl('maxCount')) &&
      quad.object.value === '1'))
      .toBe(true);

    expect(shaclQuads.some((quad: RDF.Quad) =>
      quad.predicate.equals(ns.shacl('minCount')) &&
      quad.object.value === '1'))
      .toBe(true);
  })

  it('should add cardinality constraints for a property to a quad store in mode individual', async () => {
    store.addQuads(await parseJsonld(baseData));
    config.mode = GenerationMode.Individual;

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);
    const shaclQuads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    expect(shaclQuads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/property/shape/1-MaxCountConstraint')))).toBe(true);
    expect(shaclQuads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/property/shape/1-MinCountConstraint')))).toBe(true);

    expect(shaclQuads.some((quad: RDF.Quad) =>
      quad.predicate.equals(ns.shacl('maxCount')) &&
      quad.object.value === '1'))
      .toBe(true);

    expect(shaclQuads.some((quad: RDF.Quad) =>
      quad.predicate.equals(ns.shacl('minCount')) &&
      quad.object.value === '1'))
      .toBe(true);
  })

  it('should add constraint messages for a property to a quad store', async () => {
    store.addQuads(await parseJsonld(baseData));
    config.mode = GenerationMode.Individual;
    config.addConstraintMessages = true;

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);
    const shaclQuads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    expect(shaclQuads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/property/shape/1-MaxCountConstraint')) &&
      quad.predicate.equals(ns.vl('message')) &&
      quad.object.value === 'Maximaal 1 waarde(n) verwacht voor "PropertyLabel".'))
      .toBe(true);

    expect(shaclQuads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/property/shape/1-MinCountConstraint')) &&
      quad.predicate.equals(ns.vl('message')) &&
      quad.object.value === 'Minimaal 1 waarde(n) verwacht voor "PropertyLabel".'))
      .toBe(true);
  })

  it('should throw an error when no label is found for a property', async () => {
    store.addQuads(await parseJsonld(dataWithoutLabel));
    config.mode = GenerationMode.Individual;
    config.addConstraintMessages = true;

    expect(() =>
      handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore))
      .toThrow();
  });

  it('should copy the base quads when adding cardinality constraints in mode individual', async () => {
    store.addQuads(await parseJsonld(baseData));
    config.mode = GenerationMode.Individual;

    shaclStore.addQuads([
      df.quad(
        df.namedNode('http://example.org/id/property/shape/1'),
        ns.shacl('name'),
        df.literal('PropertyLabel'),
        df.namedNode('baseQuadsGraph'),
      ),
    ])

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);
    const shaclQuads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    expect(shaclQuads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/property/shape/1-MaxCountConstraint')) &&
      quad.predicate.equals(ns.shacl('name')) &&
      quad.object.value === 'PropertyLabel'))
      .toBe(true);

    expect(shaclQuads.some((quad: RDF.Quad) =>
      quad.subject.equals(df.namedNode('http://example.org/id/property/shape/1-MinCountConstraint')) &&
      quad.predicate.equals(ns.shacl('name')) &&
      quad.object.value === 'PropertyLabel'))
      .toBe(true);
  });

  it('should return when there are no cardinality constraints', async () => {
    store.addQuads(await parseJsonld(nCardinalityConstraint));
    const addQuadSpy = jest.spyOn(shaclStore, 'addQuad');
    const addQuadsSpy = jest.spyOn(shaclStore, 'addQuads');

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);
    expect(addQuadSpy).not.toHaveBeenCalled();
    expect(addQuadsSpy).not.toHaveBeenCalled();
  });
});