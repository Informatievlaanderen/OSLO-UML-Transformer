/**
 * @group unit
 */
import 'reflect-metadata';
import { SwaggerGenerationServiceConfiguration } from '../lib/config/SwaggerGenerationServiceConfiguration';

jest.mock('@oslo-flanders/core', () => {
  return {
    ...jest.requireActual('@oslo-flanders/core'),
    createN3Store: jest.fn(),
  };
});

describe('SwaggerGenerationServiceConfiguration', () => {
  let params: any;

  beforeAll(() => {
    params = {
      input: 'input.jsonld',
      output: 'openapi.json',
      language: 'nl',
      title: 'My Title',
      description: 'My Description',
      contextURL: 'http://example.com/context.jsonld',
      baseURL: 'http://example.com/',
      contactName: 'Contact name',
      contactURL: 'http://example.com/contact/',
      contactEmail: 'Contact e-mail',
      licenseName: 'License name',
      licenseURL: 'http://example.com/license/',
      versionAPI: '1.0.0',
      versionSwagger: '3.0.4',
    };
  });

  it('should set its variables using the parameters received from the CLI', async () => {
    const config = new SwaggerGenerationServiceConfiguration();
    await config.createFromCli(params);

    expect((<any>config)._input).toBeDefined();
    expect((<any>config)._output).toBeDefined();
    expect((<any>config)._language).toBeDefined();
    expect((<any>config)._title).toBeDefined();
    expect((<any>config)._description).toBeDefined();
    expect((<any>config)._contextURL).toBeDefined();
    expect((<any>config)._baseURL).toBeDefined();
    expect((<any>config)._contactName).toBeDefined();
    expect((<any>config)._contactURL).toBeDefined();
    expect((<any>config)._contactEmail).toBeDefined();
    expect((<any>config)._licenseName).toBeDefined();
    expect((<any>config)._licenseURL).toBeDefined();
    expect((<any>config)._versionAPI).toBeDefined();
    expect((<any>config)._versionSwagger).toBeDefined();
  });

  it('should throw an error when "input" is undefined or otherwise return its value', async () => {
    const config = new SwaggerGenerationServiceConfiguration();

    expect(() => config.input).toThrowError(
      'Trying to access property "input" before it was set.',
    );
    await config.createFromCli(params);
    expect(config.input).toBe('input.jsonld');
  });

  it('should throw an error when "output" is undefined or otherwise return its value', async () => {
    const config = new SwaggerGenerationServiceConfiguration();

    expect(() => config.output).toThrowError(
      'Trying to access property "output" before it was set.',
    );
    await config.createFromCli(params);
    expect(config.output).toBe('openapi.json');
  });

  it('should throw an error when "language" is undefined or otherwise return its value', async () => {
    const config = new SwaggerGenerationServiceConfiguration();

    expect(() => config.language).toThrowError(
      'Trying to access property "language" before it was set.',
    );
    await config.createFromCli(params);
    expect(config.language).toBe('nl');
  });

  it('should throw an error when "title" is undefined or otherwise return its value', async () => {
    const config = new SwaggerGenerationServiceConfiguration();

    expect(() => config.title).toThrowError(
      'Trying to access property "title" before it was set.',
    );
    await config.createFromCli(params);
    expect(config.title).toBe('My Title');
  });

  it('should throw no error when "description" is undefined or otherwise return its value', async () => {
    const config = new SwaggerGenerationServiceConfiguration();

    await config.createFromCli(params);
    expect(config.description).toBe('My Description');
  });

  it('should throw an error when "contextURL" is undefined or otherwise return its value', async () => {
    const config = new SwaggerGenerationServiceConfiguration();

    expect(() => config.contextURL).toThrowError(
      'Trying access property "contextURL" before it was set.',
    );
    await config.createFromCli(params);
    expect(config.contextURL).toBe('http://example.com/context.jsonld');
  });

  it('should throw no error when "baseURL" is undefined or otherwise return its value', async () => {
    const config = new SwaggerGenerationServiceConfiguration();

    await config.createFromCli(params);
    expect(config.baseURL).toBe('http://example.com/');
  });

  it('should throw no error when "contactName" is undefined or otherwise return its value', async () => {
    const config = new SwaggerGenerationServiceConfiguration();

    await config.createFromCli(params);
    expect(config.contactName).toBe('Contact name');
  });

  it('should throw no error when "contactEmail" is undefined or otherwise return its value', async () => {
    const config = new SwaggerGenerationServiceConfiguration();

    await config.createFromCli(params);
    expect(config.contactEmail).toBe('Contact e-mail');
  });

  it('should throw no error when "licenseName" is undefined or otherwise return its value', async () => {
    const config = new SwaggerGenerationServiceConfiguration();

    await config.createFromCli(params);
    expect(config.licenseName).toBe('License name');
  });

  it('should throw no error when "licenseURL" is undefined or otherwise return its value', async () => {
    const config = new SwaggerGenerationServiceConfiguration();

    await config.createFromCli(params);
    expect(config.licenseURL).toBe('http://example.com/license/');
  });

  it('should throw an error when "versionAPI" is undefined or otherwise return its value', async () => {
    const config = new SwaggerGenerationServiceConfiguration();

    expect(() => config.versionAPI).toThrowError(
      'Trying to access property "versionAPI" before it was set.',
    );
    await config.createFromCli(params);
    expect(config.versionAPI).toBe('1.0.0');
  });

  it('should throw an error when "versionSwagger" is undefined or otherwise return its value', async () => {
    const config = new SwaggerGenerationServiceConfiguration();

    expect(() => config.versionSwagger).toThrowError(
      'Trying to access property "versionSwagger" before it was set.',
    );
    await config.createFromCli(params);
    expect(config.versionSwagger).toBe('3.0.4');
  });
});
