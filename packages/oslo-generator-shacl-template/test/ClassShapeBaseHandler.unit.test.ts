/**
 * @group unit
 */
import 'reflect-metadata';
import type { Logger } from '@oslo-flanders/core';
import { VoidLogger, QuadStore, ns } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import type { ShaclTemplateGenerationServiceConfiguration } from
  '../lib/config/ShaclTemplateGenerationServiceConfiguration';
import { ClassShapeBaseHandler } from '../lib/handlers/ClassShapeBaseHandler';
import { TranslationService } from '../lib/TranslationService';
import type { NamedOrBlankNode } from '../lib/types/IHandler';
import { baseData, baseDataWithoutAssignedURI } from './data/classShapeBaseHandlerMockData';
import { parseJsonld } from './util';

describe('ClassShapeBaseHandler', () => {
  const logger: Logger = new VoidLogger();
  const df: DataFactory = new DataFactory();
  const translationService: TranslationService = new TranslationService(logger);

  let store: QuadStore;
  let shaclStore: QuadStore;
  let handler: ClassShapeBaseHandler;
  let config: ShaclTemplateGenerationServiceConfiguration;

  const classIdToShapeIdMap: Map<string, NamedOrBlankNode> = new Map([
    ['http://example.org/.well-known/id/class/1', df.namedNode('http://example.org/id/shape/1')],
  ]);

  beforeEach(() => {
    store = new QuadStore();
    shaclStore = new QuadStore();
    handler = new ClassShapeBaseHandler(config, logger, translationService);
    (<any>handler).classIdToShapeIdMap = classIdToShapeIdMap;
  })

  it('should add base constraints for a class to a quad store', async () => {
    store.addQuads(await parseJsonld(baseData));
    handler.handle(df.namedNode('http://example.org/.well-known/id/class/1'), store, shaclStore);

    const shaclQuads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    expect(shaclQuads.length).toBe(3);
    expect(shaclQuads.some((quad: RDF.Quad) =>
      quad.object.equals(ns.shacl('NodeShape')) &&
      quad.subject.equals(df.namedNode('http://example.org/id/shape/1'))))
      .toBe(true);

    expect(shaclQuads.some((quad: RDF.Quad) =>
      quad.predicate.equals(ns.shacl('targetClass')) &&
      quad.object.equals(df.namedNode('http://example.org/id/class/1'))))
      .toBe(true);

    expect(shaclQuads.some((quad: RDF.Quad) =>
      quad.predicate.equals(ns.shacl('closed')) &&
      quad.object.equals(df.literal('false', ns.xsd('boolean')))))
      .toBe(true);
  });

  it('should throw an error when the assigned URI is missing', async () => {
    store.addQuads(await parseJsonld(baseDataWithoutAssignedURI));
    expect(() => handler.handle(df.namedNode('http://example.org/.well-known/id/class/1'), store, shaclStore))
      .toThrow(new Error(`Unable to find the assigned URI for subject "http://example.org/.well-known/id/class/1".`))
  })
});
