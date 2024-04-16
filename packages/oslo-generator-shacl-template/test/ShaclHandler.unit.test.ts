/**
 * @group unit
 */
import 'reflect-metadata';
import type { Logger } from '@oslo-flanders/core';
import { QuadStore, VoidLogger } from '@oslo-flanders/core';
import { DataFactory } from 'rdf-data-factory';
import { ShaclTemplateGenerationServiceConfiguration }
  from '../lib/config/ShaclTemplateGenerationServiceConfiguration';
import { TranslationService } from '../lib/TranslationService';
import { ShaclHandler } from '../lib/types/IHandler';

describe('ShaclHandler', () => {
  let handler: ShaclHandler;
  let config: ShaclTemplateGenerationServiceConfiguration;
  let logger: Logger;
  let translationService: TranslationService;
  let quadStore: QuadStore;

  beforeEach(() => {
    // Initialize your dependencies here
    config = new ShaclTemplateGenerationServiceConfiguration();
    logger = new VoidLogger();
    translationService = new TranslationService(logger);
    quadStore = new QuadStore();

    handler = new ShaclHandler(config, logger, translationService);
  });

  it('should set the next handler', () => {
    const nextHandler = new ShaclHandler(config, logger, translationService);
    handler.setNext(nextHandler);
    expect((<any>handler).next).toBe(nextHandler);
  });

  it('should handle a subject', () => {
    const subject = new DataFactory().namedNode('http://example.com/subject');

    // This assumes that you have a way to spy on the `handle` method of the next handler
    const nextHandler = new ShaclHandler(config, logger, translationService);
    const handleSpy = jest.spyOn(nextHandler, 'handle');
    handler.setNext(nextHandler);

    handler.handle(subject, quadStore, quadStore);

    // Check if the `handle` method of the next handler was called with the correct arguments
    expect(handleSpy).toHaveBeenCalledWith(subject, quadStore, quadStore);
  });

  it('should set the classIdToShapeIdMap', () => {
    const map = new Map();
    handler.classIdToShapeIdMap = map;

    expect(handler.classIdToShapeIdMap).toBeDefined();
    expect(handler.classIdToShapeIdMap).toBe(map);
  });

  it('should set the propertyIdToShapeIdMap', () => {
    const map = new Map();
    handler.propertyIdToShapeIdMap = map;

    expect(handler.propertyIdToShapeIdMap).toBeDefined();
    expect(handler.propertyIdToShapeIdMap).toBe(map);
  });

  it('should throw an error when accessing classIdToShapeIdMap before it is set', () => {
    expect(() => handler.classIdToShapeIdMap)
      .toThrow(new Error('Trying to access "classIdToShapeIdMap" before it is set.'));
  })

  it('should throw an error when accessing propertyIdToShapeIdMap before it is set', () => {
    expect(() => handler.propertyIdToShapeIdMap)
      .toThrow(new Error('Trying to access "propertyIdToShapeIdMap" before it is set.'));
  })
})