/**
 * @group unit
 */
import 'reflect-metadata';
import type { Logger } from '@oslo-flanders/core';
import { QuadStore, VoidLogger, ServiceIdentifier } from '@oslo-flanders/core';
import { SHA1 } from 'crypto-js';
import { DataFactory } from 'rdf-data-factory';
import { container } from '../lib/config/DependencyInjectionConfig';
import { ShaclTemplateGenerationServiceConfiguration } from '../lib/config/ShaclTemplateGenerationServiceConfiguration';
import { OutputHandlerService } from '../lib/OutputHandlerService';
import { PipelineService } from '../lib/PipelineService';
import { ShaclTemplateGenerationService } from '../lib/ShaclTemplateGenerationService';
import type { IHandler, NamedOrBlankNode } from '../lib/types/IHandler';
import {
  baseData,
  dataWithoutDomain,
  dataWithoutDomainLabel,
  dataWithoutLabel,
} from './data/shaclTemplateGenerationServiceMockData';
import { parseJsonld } from './test-utils';

const encrypt = (value: string): string => {
  return SHA1(value).toString();
};

describe('ShaclTemplateGenerationService', () => {
  let params: any;
  let service: ShaclTemplateGenerationService;
  const logger: Logger = new VoidLogger();
  let config: ShaclTemplateGenerationServiceConfiguration;
  let store: QuadStore;
  let pipelineService: PipelineService;
  let outputHandlerService: OutputHandlerService;
  const df: DataFactory = new DataFactory();
  let classIds: NamedOrBlankNode[];
  let propertyIds: NamedOrBlankNode[];

  beforeAll(() => {
    container.bind<Logger>(ServiceIdentifier.Logger).toConstantValue(logger);
  });

  beforeEach(async () => {
    params = {
      input: 'test.jsonld',
      output: 'shacl.jsonld',
      outputFormat: 'application/ld+json',
      language: 'en',
      shapeBaseURI: 'http://example.org/',
      mode: 'grouped',
      constraint: [],
      applicationProfileURL: 'http://example.org/doc/applicatieprofiel/test',
      uniqueURIs: false,
      addConstraintMessages: false,
      addRuleNumbers: false,
    };
    config = new ShaclTemplateGenerationServiceConfiguration();
    await config.createFromCli(params);

    store = new QuadStore();
    pipelineService = new PipelineService(logger);
    outputHandlerService = new OutputHandlerService(config);

    service = new ShaclTemplateGenerationService(
      logger,
      config,
      store,
      pipelineService,
      outputHandlerService,
    );

    classIds = [df.namedNode('http://example.org/.well-known/id/class/1')];

    propertyIds = [
      df.namedNode('http://example.org/.well-known/id/property/1'),
    ];
  });

  it('should initialize correctly', async () => {
    store.addQuadsFromFile = jest.fn();
    const addQuadsFromFileSpy = jest.spyOn(store, 'addQuadsFromFile');
    const createPipelinesSpy = jest.spyOn(pipelineService, 'createPipelines');

    await service.init();

    expect(createPipelinesSpy).toHaveBeenCalledWith(config);
    expect(addQuadsFromFileSpy).toHaveBeenCalledWith(config.input);
  });

  it('should run correctly', async () => {
    const mockHandler: IHandler = {
      setNext: jest.fn(),
      handle: jest.fn(),
    };

    const mockPipeline = {
      handlers: [mockHandler],
      handle: jest.fn(),
      loadSubjectIdToShapeIdMaps: jest.fn(),
    };

    store.addQuads(await parseJsonld(baseData));

    (<any>pipelineService)._classPipeline = mockPipeline;
    (<any>pipelineService)._propertyPipeline = mockPipeline;

    const handleSpy = jest.spyOn(pipelineService.classPipeline, 'handle');
    const writeSpy = jest.spyOn(outputHandlerService, 'write');

    await service.run();

    expect(handleSpy).toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalled();
  });

  it('should create a classIdToSubjectIdMap for classes and datatypes', async () => {
    store.addQuads(await parseJsonld(baseData));
    const map: Map<string, NamedOrBlankNode> = (<any>(
      service
    )).createSubjectToShapeIdMap(classIds, false);

    expect(map.get('http://example.org/.well-known/id/class/1')).toEqual(
      df.namedNode('http://example.org/ClassLabelShape'),
    );
  });

  it('should create a propertyIdToSubjectIdMap', async () => {
    store.addQuads(await parseJsonld(baseData));

    const mapWithNamedNodes: Map<string, NamedOrBlankNode> = (<any>(
      service
    )).createSubjectToShapeIdMap(propertyIds, false);
    expect(
      mapWithNamedNodes.get('http://example.org/.well-known/id/property/1'),
    ).toEqual(
      df.namedNode(
        `http://example.org/${encrypt('ClassLabel.PropertyLabelProperty')}`,
      ),
    );

    const mapWithBlankNodes: Map<string, NamedOrBlankNode> = (<any>(
      service
    )).createSubjectToShapeIdMap(propertyIds, true);
    expect(
      mapWithBlankNodes.get('http://example.org/.well-known/id/property/1')
        ?.termType,
    ).toEqual('BlankNode');
  });

  it('should throw an error when the label of a subject can not be found', async () => {
    store.addQuads(await parseJsonld(dataWithoutLabel));

    expect(() =>
      (<any>service).createSubjectToShapeIdMap(classIds, false),
    ).toThrow(
      new Error(
        `Unable to find a label for subject "http://example.org/.well-known/id/class/1".`,
      ),
    );
  });

  it('should throw an error when the domain of a property can not be found', async () => {
    store.addQuads(await parseJsonld(dataWithoutDomain));

    expect(() =>
      (<any>service).createSubjectToShapeIdMap(propertyIds, false),
    ).toThrow(
      new Error(
        `Unable to find the domain for subject "http://example.org/.well-known/id/property/1".`,
      ),
    );
  });

  it('should throw an error when the domain label can not be found', async () => {
    store.addQuads(await parseJsonld(dataWithoutDomainLabel));

    expect(() =>
      (<any>service).createSubjectToShapeIdMap(propertyIds, false),
    ).toThrow(
      new Error(
        `Unable to find the label for domain "http://example.org/.well-known/id/class/1".`,
      ),
    );
  });
});
