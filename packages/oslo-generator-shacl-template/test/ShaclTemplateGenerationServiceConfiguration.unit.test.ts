/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @group unit
 */
import 'reflect-metadata';
import { OutputFormat } from '@oslo-flanders/core';
import { ShaclTemplateGenerationServiceConfiguration } from '../lib/config/ShaclTemplateGenerationServiceConfiguration';
import { GenerationMode } from '../lib/enums/GenerationMode';

jest.mock('@oslo-flanders/core', () => {
  return {
    ...jest.requireActual('@oslo-flanders/core'),
    createN3Store: jest.fn(),
  };
});

describe('ShaclTemplateGenerationServiceConfiguration', () => {
  let params: any;

  beforeEach(() => {
    params = {
      input: 'test.jsonld',
      output: 'shacl.jsonld',
      outputFormat: OutputFormat.JsonLd,
      language: 'en',
      shapeBaseURI: 'http://example.org/',
      mode: 'grouped',
      constraint: [],
      applicationProfileURL: 'http://example.org/doc/applicatieprofiel/test',
      uniqueURIs: false,
      addConstraintMessages: false,
      addRuleNumbers: false,
    }
  });

  it('should set its variables using the parameters received from the CLI', async () => {
    const config = new ShaclTemplateGenerationServiceConfiguration();
    await config.createFromCli(params);

    expect((<any>config)._input).toBeDefined();
    expect((<any>config)._output).toBeDefined();
    expect((<any>config)._outputFormat).toBeDefined();
    expect((<any>config)._language).toBeDefined();
    expect((<any>config)._shapeBaseURI).toBeDefined();
    expect((<any>config)._mode).toBeDefined();
    expect((<any>config)._constraint).toBeDefined();
    expect((<any>config)._applicationProfileURL).toBeDefined();
    expect((<any>config)._useUniqueURIs).toBeDefined();
    expect((<any>config)._addConstraintMessages).toBeDefined();
    expect((<any>config)._addConstraintRuleNumbers).toBeDefined();
  })

  it('should throw an error when "input" is undefined or otherwise return its value', async () => {
    const config = new ShaclTemplateGenerationServiceConfiguration();

    expect(() => config.input).toThrow(new Error('Trying to access "input" before it was set.'));
    await config.createFromCli(params);
    expect(config.input).toBe('test.jsonld');
  })

  it('should throw an error when "output" is undefined or otherwise return its value', async () => {
    const config = new ShaclTemplateGenerationServiceConfiguration();

    expect(() => config.output).toThrow(new Error('Trying to access "output" before it was set.'));
    await config.createFromCli(params);
    expect(config.output).toBe('shacl.jsonld');
  })

  it('should throw an error when "outputFormat" is undefined or otherwise return its value', async () => {
    const config = new ShaclTemplateGenerationServiceConfiguration();

    expect(() => config.outputFormat).toThrow(new Error('Trying to access "outputFormat" before it was set.'));
    await config.createFromCli(params);
    expect(config.outputFormat).toBe(OutputFormat.JsonLd);
  })

  it('should throw an error when "language" is undefined or otherwise return its value', async () => {
    const config = new ShaclTemplateGenerationServiceConfiguration();

    expect(() => config.language).toThrow(new Error('Trying to access "language" before it was set.'));
    await config.createFromCli(params);
    expect(config.language).toBe('en');
  })

  it('should throw an error when "shapeBaseURI" is undefined or otherwise return its value', async () => {
    const config = new ShaclTemplateGenerationServiceConfiguration();

    expect(() => config.shapeBaseURI).toThrow(new Error('Trying to access "shapeBaseURI" before it was set.'));
    await config.createFromCli(params);
    expect(config.shapeBaseURI).toBe('http://example.org/');
  })

  it('should throw an error when "mode" is undefined or otherwise return its value', async () => {
    const config = new ShaclTemplateGenerationServiceConfiguration();

    expect(() => config.mode).toThrow(new Error('Trying to access "mode" before it was set.'));
    await config.createFromCli(params);
    expect(config.mode).toBe(GenerationMode.Grouped);
  })

  it('should throw an error when "constraint" is undefined or otherwise return its value', async () => {
    const config = new ShaclTemplateGenerationServiceConfiguration();

    expect(() => config.constraint).toThrow(new Error('Trying to access "constraints" before it was set.'));
    await config.createFromCli(params);
    expect(config.constraint).toStrictEqual([]);
  })

  it('should throw an error when "applicationProfileURL" is undefined or otherwise return its value', async () => {
    const config = new ShaclTemplateGenerationServiceConfiguration();

    expect(() => config.applicationProfileURL)
      .toThrow(new Error('Trying to access "applicationProfileURL" before it was set.'));
    await config.createFromCli(params);
    expect(config.applicationProfileURL).toBe('http://example.org/doc/applicatieprofiel/test');
  })

  it('should throw an error when "useUniqueURIs" is undefined or otherwise return its value', async () => {
    const config = new ShaclTemplateGenerationServiceConfiguration();

    expect(() => config.useUniqueURIs).toThrow(new Error('Trying to access "useUniqueURIs" before it was set.'));
    await config.createFromCli(params);
    expect(config.useUniqueURIs).toBe(false);
  })

  it('should throw an error when "addConstraintMessages" is undefined or otherwise return its value', async () => {
    const config = new ShaclTemplateGenerationServiceConfiguration();

    expect(() => config.addConstraintMessages)
      .toThrow(new Error('Trying to access "addConstraintMessages" before it was set.'));
    await config.createFromCli(params);
    expect(config.addConstraintMessages).toBe(false);
  })

  it('should throw an error when "addConstraintRuleNumbers" is undefined or otherwise return its value', async () => {
    const config = new ShaclTemplateGenerationServiceConfiguration();

    expect(() => config.addConstraintRuleNumbers)
      .toThrow(new Error('Trying to access "addConstraintRuleNumbers" before it was set.'));
    await config.createFromCli(params);
    expect(config.addConstraintRuleNumbers).toBe(false);
  })
})