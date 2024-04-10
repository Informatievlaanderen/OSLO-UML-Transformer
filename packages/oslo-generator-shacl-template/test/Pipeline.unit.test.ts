/**
 * @group unit
 */
import 'reflect-metadata';
import type { Logger } from '@oslo-flanders/core';
import { QuadStore, VoidLogger } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import type { ShaclTemplateGenerationServiceConfiguration }
  from '../lib/config/ShaclTemplateGenerationServiceConfiguration';
import { TranslationService } from '../lib/TranslationService';
import type { NamedOrBlankNode } from '../lib/types/IHandler';
import { ShaclHandler } from '../lib/types/IHandler';
import { Pipeline } from '../lib/types/Pipeline';

describe('Pipeline', () => {
  let pipeline: Pipeline;
  let handler1: ShaclHandler;
  let handler2: ShaclHandler;
  let subject: RDF.NamedNode;
  let store: QuadStore;
  let shaclStore: QuadStore;
  let config: ShaclTemplateGenerationServiceConfiguration;
  const logger: Logger = new VoidLogger();
  const translationService = new TranslationService(logger);
  const df: DataFactory = new DataFactory();

  beforeEach(() => {
    pipeline = new Pipeline();
    handler1 = new ShaclHandler(config, logger, translationService);
    handler2 = new ShaclHandler(config, logger, translationService);
    subject = df.namedNode('http://example.com/subject');
    store = new QuadStore();
    shaclStore = new QuadStore();
  });

  it('should add a component', () => {
    pipeline.addComponent(handler1);
    expect((<any>pipeline).components).toContain(handler1);
  });

  it('should set the next handler when adding a component', () => {
    pipeline.addComponent(handler1);
    pipeline.addComponent(handler2);
    expect((<any>handler1).next).toBe(handler2);
  });

  it('should load subjectIdToShapeIdMaps', () => {
    const map1 = new Map<string, NamedOrBlankNode>();
    const map2 = new Map<string, NamedOrBlankNode>();
    pipeline.addComponent(handler1);
    pipeline.loadSubjectIdToShapeIdMaps(map1, map2);
    expect(handler1.classIdToShapeIdMap).toBe(map1);
    expect(handler1.propertyIdToShapeIdMap).toBe(map2);
  });

  it('should handle a subject', () => {
    const handleSpy = jest.spyOn(handler1, 'handle');
    pipeline.addComponent(handler1);
    pipeline.handle(subject, store, shaclStore);
    expect(handleSpy).toHaveBeenCalledWith(subject, store, shaclStore);
  });
})