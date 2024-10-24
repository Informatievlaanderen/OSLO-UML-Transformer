import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import {
  QuadStore,
  VoidLogger,
  ServiceIdentifier,
  getApplicationProfileLabel,
} from '@oslo-flanders/core';
import { DataFactory } from 'rdf-data-factory';
import { container } from '../lib/config/DependencyInjectionConfig';
import type { ExamplesGenerationServiceConfiguration } from '../lib/config/ExamplesGenerationServiceConfiguration';
import { ExamplesGenerationService } from '../lib/ExamplesGenerationService';
import type { ExampleObject } from '../lib/interfaces/ExampleObject';

jest.mock('fs');

jest.mock('@oslo-flanders/core', () => {
  return {
    ...jest.requireActual('@oslo-flanders/core'),
    createN3Store: jest.fn(),
  };
});

describe('ExamplesGenerationService', () => {
  let service: ExamplesGenerationService;
  const logger = new VoidLogger();
  let config: ExamplesGenerationServiceConfiguration;
  let store: QuadStore;
  const df = new DataFactory();

  beforeAll(() => {
    container.bind(ServiceIdentifier.Logger).toConstantValue(logger);
  });

  beforeEach(() => {
    store = new QuadStore();
    service = new ExamplesGenerationService(
      logger,
      <ExamplesGenerationServiceConfiguration>{
        language: 'en',
        output: 'config.json',
      },
      store,
    );

    store = new QuadStore();
    service = new ExamplesGenerationService(logger, config, store);
  });

  it('should initialize correctly', async () => {
    store.addQuadsFromFile = jest.fn();
    const addQuadsFromFileSpy = jest.spyOn(store, 'addQuadsFromFile');

    await service.init();

    expect(addQuadsFromFileSpy).toHaveBeenCalledWith(config.input);
  });

  it('should run correctly', async () => {
    const mockExample: ExampleObject = {
      '@context': 'http://example.org/context/example.jsonld',
      '@type': 'http://example.org/ExampleType',
      '@id': '{{ID}}',
      fileName: 'example',
    };

    service.generateExample = jest.fn().mockReturnValue(mockExample);
    service.ensureOutputDirectory = jest.fn();
    service.writeExamples = jest.fn();

    await service.run();

    expect(service.generateExample).toHaveBeenCalled();
    expect(service.ensureOutputDirectory).toHaveBeenCalled();
    expect(service.writeExamples).toHaveBeenCalledWith([mockExample]);
  });

  it('should generate an example object correctly', () => {
    const entity = df.namedNode('http://example.org/ExampleEntity');
    store.getAssignedUri = jest.fn().mockReturnValue(entity);
    service.fetchProperty = jest.fn().mockReturnValue('ExampleLabel');
    service.addPropertySpecificInformation = jest.fn().mockReturnValue([]);

    const example = service.generateExample(entity);

    expect(example).toEqual({
      '@context': 'http://example.org/context/exampleLabel.jsonld',
      '@type': 'http://example.org/ExampleEntity',
      '@id': '{{ID}}',
      fileName: 'exampleLabel',
    });
  });
  it('should fetch property values correctly', () => {
    const entity = df.namedNode('http://example.org/ExampleEntity');

    const value = service.fetchProperty(getApplicationProfileLabel, entity);

    expect(value).toBe('ExampleLabel');
  });

  it('should generate example properties correctly', () => {
    const property = df.namedNode('http://example.org/ExampleProperty');
    store.getRange = jest
      .fn()
      .mockReturnValue(df.namedNode('http://example.org/ExampleRange'));
    store.getAssignedUri = jest
      .fn()
      .mockReturnValue(df.namedNode('http://example.org/ExampleRangeUri'));

    const exampleProperty = service.generateExampleProperty(property);

    expect(exampleProperty).toEqual({
      examplePropertyLabel: 'ExampleRangeUri',
    });
  });

  it('should ensure output directory exists', () => {
    const examplesDir = path.join(config.output);
    fs.existsSync = jest.fn().mockReturnValue(false);
    fs.mkdirSync = jest.fn();

    service.ensureOutputDirectory();

    expect(fs.existsSync).toHaveBeenCalledWith(examplesDir);
    expect(fs.mkdirSync).toHaveBeenCalledWith(examplesDir);
  });

  it('should write examples to files', () => {
    const examplesDir = config.output;
    const example: ExampleObject = {
      '@context': 'http://example.org/context/example.jsonld',
      '@type': 'http://example.org/ExampleType',
      '@id': '{{ID}}',
      fileName: 'example',
    };
    const filePath = path.join(examplesDir, 'example.json');
    fs.writeFileSync = jest.fn();

    service.writeExamples([example]);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      filePath,
      JSON.stringify(
        {
          '@context': 'http://example.org/context/example.jsonld',
          '@type': 'http://example.org/ExampleType',
          '@id': '{{ID}}',
        },
        null,
        2,
      ),
    );
  });
});
