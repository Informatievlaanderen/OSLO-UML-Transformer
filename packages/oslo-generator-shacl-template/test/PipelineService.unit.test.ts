/**
 * @group unit
 */
import 'reflect-metadata';
import type { Logger } from '@oslo-flanders/core';
import { VoidLogger, ServiceIdentifier } from '@oslo-flanders/core';
import { container } from '../lib/config/DependencyInjectionConfig';
import { ShaclTemplateGenerationServiceConfiguration } from
  '../lib/config/ShaclTemplateGenerationServiceConfiguration';
import { PipelineService } from '../lib/PipelineService';
import type { NamedOrBlankNode, ShaclHandler } from '../lib/types/IHandler';
import type { Pipeline } from '../lib/types/Pipeline';

describe('PipelineService', () => {
  let params: any;
  let config: ShaclTemplateGenerationServiceConfiguration;
  const logger: Logger = new VoidLogger();
  let service: PipelineService;

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
    }

    config = new ShaclTemplateGenerationServiceConfiguration();
    await config.createFromCli(params);

    service = new PipelineService(logger);
    service.createPipelines(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should return the "classPipeline"', () => {
    const pipelineService = new PipelineService(logger);
    expect(() => pipelineService.classPipeline)
      .toThrow(new Error(`Trying to access "classPipeline" before it is set.`));

    pipelineService.createPipelines(config);
    expect(() => pipelineService.classPipeline).toBeDefined();
  });

  it('should return the "propertyPipeline"', () => {
    const pipelineService = new PipelineService(logger);
    expect(() => pipelineService.propertyPipeline)
      .toThrow(new Error(`Trying to access "propertyPipeline" before it is set.`));

    pipelineService.createPipelines(config);
    expect(pipelineService.propertyPipeline).toBeDefined();
  })

  it('should load the subjectIdToShapeIdMaps for the pipelines', () => {
    const classSpy = jest.spyOn(service.classPipeline, 'loadSubjectIdToShapeIdMaps');
    const propertySpy = jest.spyOn(service.propertyPipeline, 'loadSubjectIdToShapeIdMaps');
    const map = new Map<string, NamedOrBlankNode>();

    service.loadSubjectIdToShapeIdMaps(map, map);

    expect(classSpy).toHaveBeenCalled();
    expect(propertySpy).toHaveBeenCalled();
  });

  it('should create a base pipeline for properties and classes', () => {
    expect(doesPipelineContainClass(service.classPipeline, 'ClassShapeBaseHandler')).toBe(true);
    expect(doesPipelineContainClass(service.propertyPipeline, 'PropertyShapeBaseHandler')).toBe(true);
    expect(doesPipelineContainClass(service.propertyPipeline, 'CardinalityConstraintHandler')).toBe(true);
  })

  it('should add the NodeKindConstraintHandler to the property pipeline', async () => {
    params.constraint = ['nodeKind'];
    await config.createFromCli(params);
    service = new PipelineService(logger);
    service.createPipelines(config);

    expect(doesPipelineContainClass(service.propertyPipeline, 'NodeKindConstraintHandler')).toBe(true);
  })

  it('should add the UniqueLanguageConstraintHandler to the property pipeline', async () => {
    params.constraint = ['uniqueLanguages'];
    await config.createFromCli(params);
    service = new PipelineService(logger);
    service.createPipelines(config);

    expect(doesPipelineContainClass(service.propertyPipeline, 'UniqueLanguageConstraintHandler')).toBe(true);
  })

  it('should add the CodelistConstraintHandler to the property pipeline', async () => {
    params.constraint = ['codelist'];
    await config.createFromCli(params);
    service = new PipelineService(logger);
    service.createPipelines(config);

    expect(doesPipelineContainClass(service.propertyPipeline, 'CodelistConstraintHandler')).toBe(true);
  })
})

function doesPipelineContainClass(pipeline: Pipeline, name: string): boolean {
  return (<any[]>(<any>pipeline).components).some((x: ShaclHandler) => x.constructor.name === name);
}