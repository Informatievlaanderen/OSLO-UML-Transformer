/**
 * @group unit
 */
import 'reflect-metadata';
import { RmlGenerationServiceConfiguration } from '../lib/config/RmlGenerationServiceConfiguration';

jest.mock('@oslo-flanders/core', () => {
  return {
    ...jest.requireActual('@oslo-flanders/core'),
    createN3Store: jest.fn(),
  };
});

describe('RmlGenerationServiceConfiguration', () => {
  let params: any;

  beforeAll(() => {
    params = {
      input: 'input.jsonld',
      output: 'mappingsDirectory',
      language: 'nl',
    };
  });

  it('should set its variables using the parameters received from the CLI', async () => {
    const config = new RmlGenerationServiceConfiguration();
    await config.createFromCli(params);

    expect((<any>config)._input).toBeDefined();
    expect((<any>config)._output).toBeDefined();
    expect((<any>config)._language).toBeDefined();
  });

  it('should throw an error when "input" is undefined or otherwise return its value', async () => {
    const config = new RmlGenerationServiceConfiguration();

    expect(() => config.input).toThrowError(
      'Trying to access property "input" before it was set.',
    );
    await config.createFromCli(params);
    expect(config.input).toBe('input.jsonld');
  });

  it('should throw an error when "output" is undefined or otherwise return its value', async () => {
    const config = new RmlGenerationServiceConfiguration();

    expect(() => config.output).toThrowError(
      'Trying to access property "output" before it was set.',
    );
    await config.createFromCli(params);
    expect(config.output).toBe('mappingsDirectory');
  });

  it('should throw an error when "language" is undefined or otherwise return its value', async () => {
    const config = new RmlGenerationServiceConfiguration();

    expect(() => config.language).toThrowError(
      'Trying to access property "language" before it was set.',
    );
    await config.createFromCli(params);
    expect(config.language).toBe('nl');
  });
});
