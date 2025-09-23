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
import { PropertyShapeBaseHandler } from '../lib/handlers/PropertyShapeBaseHandler';
import { TranslationService } from '../lib/TranslationService';
import type { NamedOrBlankNode } from '../lib/types/IHandler';
import {
  baseData,
  dataWithNoAssignedURI,
  dataWithNoDescription,
  dataWithNoDomain,
  dataWithNoLabel,
  dataWithNoRange,
  dataWithNoRangeAssignedURI,
  dataWithNoType,
  dataWithoutDomainLabel,
} from './data/propertyShapeBaseHandlerMockData';
import { parseJsonld } from './test-utils';

describe('PropertyShapeBaseHandler', () => {
  const logger: Logger = new VoidLogger();
  const df: DataFactory = new DataFactory();
  const translationService: TranslationService = new TranslationService(logger);

  let handler: PropertyShapeBaseHandler;
  let store: QuadStore;
  let shaclStore: QuadStore;
  let config: ShaclTemplateGenerationServiceConfiguration;

  let propertyIdToShapeIdMap: Map<string, NamedOrBlankNode>;
  let classIdToShapeIdMap: Map<string, NamedOrBlankNode>;
  let params: any;

  beforeEach(async () => {
    store = new QuadStore();
    shaclStore = new QuadStore();
    config = new ShaclTemplateGenerationServiceConfiguration();

    params = {
      mode: 'grouped',
      language: 'nl',
      applicationProfileURL: '',
      constraint: [],
      addRuleNumbers: false,
    }

    await config.createFromCli(params);
    handler = new PropertyShapeBaseHandler(config, logger, translationService);

    propertyIdToShapeIdMap = new Map<string, NamedOrBlankNode>([
      ['http://example.org/.well-known/id/property/1', df.namedNode('http://example.org/id/property/shape/1')],
    ]);

    classIdToShapeIdMap = new Map<string, NamedOrBlankNode>([
      ['http://example.org/.well-known/id/class/1', df.namedNode('http://example.org/id/class/shape/1')],
      ['http://example.org/.well-known/id/class/2', df.namedNode('http://example.org/id/class/shape/2')],
    ]);

    (<any>handler).propertyIdToShapeIdMap = propertyIdToShapeIdMap;
    (<any>handler).classIdToShapeIdMap = classIdToShapeIdMap;
  });

  it('should add base quads to the quad store', async () => {
    store.addQuads(await parseJsonld(baseData));
    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);

    const quads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    expect(quads.length).toBe(5);
    expect((quads.some((quad: RDF.Quad) =>
      quad.predicate.equals(df.namedNode('http://www.w3.org/ns/shacl#path')) &&
      quad.object.value === 'http://example.org/id/property/1')))
      .toBe(true);
    expect((quads.some((quad: RDF.Quad) =>
      quad.predicate.equals(df.namedNode('http://www.w3.org/ns/shacl#name')) &&
      quad.object.equals(df.literal('Property label', 'nl')))))
      .toBe(true)
    expect((quads.some((quad: RDF.Quad) =>
      quad.predicate.equals(df.namedNode('http://www.w3.org/ns/shacl#class')) &&
      quad.subject.value === 'http://example.org/id/property/shape/1' &&
      quad.object.value === 'http://example.org/id/class/1')))
      .toBe(true);
    expect((quads.some((quad: RDF.Quad) =>
      quad.predicate.equals(df.namedNode('http://www.w3.org/ns/shacl#property')) &&
      quad.subject.value === 'http://example.org/id/class/shape/2' &&
      quad.object.value === 'http://example.org/id/property/shape/1')))
      .toBe(true);
  })

  it('should add a link to the application profile is option is configured', async () => {
    store.addQuads(await parseJsonld(baseData));
    params.applicationProfileURL = 'http://example.org/ap';
    await config.createFromCli(params);

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);
    const quads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    expect(quads.length).toBe(6);
    expect((quads.some((quad: RDF.Quad) =>
      quad.predicate.equals(df.namedNode('http://www.w3.org/2000/01/rdf-schema#seeAlso')) &&
      quad.subject.equals(df.namedNode('http://example.org/id/property/shape/1')) &&
      quad.object.equals(df.namedNode('http://example.org/ap#DomainClassLabel.PropertyLabel')))))
      .toBe(true);
  })

  it('should throw an error if the assigned URI for subject is not found', async () => {
    store.addQuads(await parseJsonld(dataWithNoAssignedURI));

    expect(() => handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore))
      .toThrow(new Error(`Unable to find the assigned URI for subject "http://example.org/.well-known/id/property/1".`));
  })

  it('should throw an error when the label for subject is not found', async () => {
    store.addQuads(await parseJsonld(dataWithNoLabel));

    expect(() => handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore))
      .toThrow(new Error(`Unable to find the label for subject "http://example.org/.well-known/id/property/1".`));
  });

  it('should log a warning when the description for subject is not found', async () => {
    store.addQuads(await parseJsonld(dataWithNoDescription));
    jest.spyOn(logger, 'warn');

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore)
    expect(logger.warn).toHaveBeenCalled();
  });

  it('should throw an error when the range for subject is not found', async () => {
    store.addQuads(await parseJsonld(dataWithNoRange));

    expect(() => handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore))
      .toThrow(new Error(`Unable to find the range for subject "http://example.org/.well-known/id/property/1".`));
  });

  it('should throw an error when the range assigned URI is not found', async () => {
    store.addQuads(await parseJsonld(dataWithNoRangeAssignedURI));

    expect(() => handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore))
      .toThrow(new Error(`Unable to find the assigned URI for range "http://example.org/.well-known/id/class/1".`));
  });

  it('should throw an error when the property type is not found', async () => {
    store.addQuads(await parseJsonld(dataWithNoType));

    expect(() => handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore))
      .toThrow(new Error(`Unable to find the type for subject "http://example.org/.well-known/id/property/1".`));
  });

  it('should throw an error when the domain is not found', async () => {
    store.addQuads(await parseJsonld(dataWithNoDomain));

    expect(() => handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore))
      .toThrow(new Error(`Unable to find the domain for subject "http://example.org/.well-known/id/property/1".`));
  });

  it('should throw an error when the domain label can not be found', async () => {
    store.addQuads(await parseJsonld(dataWithoutDomainLabel));
    params.applicationProfileURL = 'http://example.org/ap';
    await config.createFromCli(params);

    expect(() => handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore))
      .toThrow(new Error(`Unable to find a label for the domain "http://example.org/.well-known/id/class/2" of subject "http://example.org/.well-known/id/property/1".`));
  });

  it('should add a vl:rule quad is the option is set in the configuration', async () => {
    store.addQuads(await parseJsonld(baseData));
    params.addRuleNumbers = true;
    await config.createFromCli(params);

    handler.handle(df.namedNode('http://example.org/.well-known/id/property/1'), store, shaclStore);
    const quads: RDF.Quad[] = shaclStore.findQuads(null, null, null, null);

    expect(quads.length).toBe(6);
    expect((quads.some((quad: RDF.Quad) =>
      quad.predicate.equals(df.namedNode('https://data.vlaanderen.be/ns/shacl#rule')) &&
      quad.subject.equals(df.namedNode('http://example.org/id/property/shape/1')) &&
      quad.object.equals(df.literal('')))))
      .toBe(true);
  })
});
