/**
 * @group unit
 */
import 'reflect-metadata';
import type { Logger } from '@oslo-flanders/core';
import { QuadStore, VoidLogger } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { GenerationMode } from '../lib/enums/GenerationMode';
import { CodelistConstraintHandler } from '../lib/handlers/CodelistConstraintHandler';
import { TranslationService } from '../lib/TranslationService';
import type { NamedOrBlankNode } from '../lib/types/IHandler'
import { ShaclHandler } from '../lib/types/IHandler';
import {
  baseData,
  propertyWithoutCodelist,
  propertyWithoutCodelistOrRange,
  propertyWithoutLabel,
  rangeWithCodelist,
} from './data/codelistConstraintHandlerMockData';
import { parseJsonld } from './util';

describe('CodelistConstraintHandler', () => {
  const logger: Logger = new VoidLogger();
  const df: RDF.DataFactory = new DataFactory();
  const translationService: TranslationService = new TranslationService(logger);

  let store: QuadStore;
  let shaclStore: QuadStore;
  let handler: CodelistConstraintHandler;
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

    handler = new CodelistConstraintHandler(config, logger, translationService);
    (<any>handler).propertyIdToShapeIdMap = propertyIdToShapeIdMap;
  });

  it('should add a codelist constraint in grouped mode', async () => {
    store.addQuads(await parseJsonld(baseData));

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);
    const shaclQuads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    expect(shaclQuads.some(quad =>
      quad.predicate.equals(df.namedNode('http://purl.org/linked-data/cube#codeList')) &&
      quad.object.equals(df.namedNode('http://example.org/id/codelist/1'))))
      .toBe(true);
  });

  it('should add a codelist constraints in individual mode', async () => {
    config.mode = GenerationMode.Individual;
    store.addQuads(await parseJsonld(baseData));

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);
    const shaclQuads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    expect(shaclQuads.some(quad =>
      quad.predicate.equals(df.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')) &&
      quad.object.equals(df.namedNode('http://www.w3.org/ns/shacl#NodeConstraint'))))
      .toBe(true);
    expect(shaclQuads.some(quad =>
      quad.predicate.equals(df.namedNode('http://www.w3.org/ns/shacl#nodeKind')) &&
      quad.object.equals(df.namedNode('http://www.w3.org/ns/shacl#IRI'))))
      .toBe(true);
    expect(shaclQuads.some(quad =>
      quad.predicate.equals(df.namedNode('http://www.w3.org/ns/shacl#class')) &&
      quad.object.equals(df.namedNode('http://www.w3.org/2004/02/skos/core#ConceptScheme'))))
      .toBe(true);
    expect(shaclQuads.some(quad =>
      quad.predicate.equals(df.namedNode('http://www.w3.org/ns/shacl#hasValue')) &&
      quad.object.equals(df.namedNode('http://example.org/id/codelist/1'))))
      .toBe(true);
    expect(shaclQuads.some(quad =>
      quad.predicate.equals(df.namedNode('http://www.w3.org/ns/shacl#minCount')) &&
      quad.object.equals(df.literal('1', df.namedNode('http://www.w3.org/2001/XMLSchema#integer')))))
      .toBe(true);
    expect(shaclQuads.some(quad =>
      quad.predicate.equals(df.namedNode('http://www.w3.org/ns/shacl#path')) &&
      quad.object.equals(df.namedNode('http://www.w3.org/2004/02/skos/core#inScheme'))))
      .toBe(true);
  });

  it('should copy the base quads to the new constraint in individual mode', async () => {
    config.mode = GenerationMode.Individual;
    store.addQuads(await parseJsonld(baseData));

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);
    const shaclQuads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    expect(shaclQuads.some(quad =>
      quad.predicate.equals(df.namedNode('http://www.w3.org/ns/shacl#property')) &&
      quad.subject.equals(df.namedNode('http://example.org/id/property/shape/1')) &&
      quad.object.equals(df.namedNode('http://example.org/id/property/shape/1-CodelistConstraint'))))
      .toBe(true);

    expect(shaclQuads.some(quad =>
      quad.predicate.equals(df.namedNode('http://www.w3.org/ns/shacl#class')) &&
      quad.subject.equals(df.namedNode('http://example.org/id/property/shape/1-CodelistConstraint')) &&
      quad.object.equals(df.namedNode('http://example.org/id/class/1'))))
      .toBe(true);
  });

  it('should look for a codelist at the range object', async () => {
    store.addQuads(await parseJsonld(rangeWithCodelist));
    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);
    const shaclQuads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    expect(shaclQuads.some(quad =>
      quad.predicate.equals(df.namedNode('http://purl.org/linked-data/cube#codeList')) &&
      quad.object.equals(df.namedNode('http://example.org/id/codelist/1'))))
      .toBe(true);
  });

  it('should throw an error when the range can not be found', async () => {
    store.addQuads(await parseJsonld(propertyWithoutCodelistOrRange));
    expect(() => handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore))
      .toThrow(new Error(`No range found for subject "http://example.org/.well-known/id/property/1".`))
  });

  it('should call the super handle method if there is no codelist', async () => {
    store.addQuads(await parseJsonld(propertyWithoutCodelist));
    const spy = jest.spyOn(ShaclHandler.prototype, 'handle');

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);

    expect(spy).toHaveBeenCalled();
  });

  it('should add a constraint message in individual mode', async () => {
    config.mode = GenerationMode.Individual;
    config.addConstraintMessages = true;
    store.addQuads(await parseJsonld(baseData));

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);
    const shaclQuads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    expect(shaclQuads.some(quad =>
      quad.subject.equals(df.namedNode('http://example.org/id/property/shape/1-CodelistConstraint')) &&
      quad.predicate.equals(df.namedNode('https://data.vlaanderen.be/ns/shacl#message')) &&
      quad.object.equals(
        df.literal('Enkel waarden uit codelijst <http://example.org/id/codelist/1> verwacht voor "PropertyLabel".'),
      )))
      .toBe(true);
  });

  it('should throw an erro when the label can not be found', async () => {
    config.mode = GenerationMode.Individual;
    config.addConstraintMessages = true;
    store.addQuads(await parseJsonld(propertyWithoutLabel));

    expect(() => handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore))
      .toThrow(new Error(`Unable to find the label for subject "http://example.org/.well-known/id/property/1".`))
  })
});