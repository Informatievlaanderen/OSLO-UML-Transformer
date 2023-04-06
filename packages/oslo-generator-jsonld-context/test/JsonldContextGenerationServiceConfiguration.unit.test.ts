/**
 * @group unit
 */
import 'reflect-metadata';
import { JsonldContextGenerationServiceConfiguration } from '../lib/config/JsonldContextGenerationServiceConfiguration';

const params: any = {
  input: 'test.jsonld',
  output: 'context.jsonld',
  addDomainPrefix: true,
  language: 'en',
};

describe('JsonldContextGenerationServiceConfiguration', () => {
  it('should set its variables using the parameters received from the CLI', async () => {
    const config = new JsonldContextGenerationServiceConfiguration();
    await config.createFromCli(params);

    expect((<any>config)._input).toBeDefined();
    expect((<any>config)._output).toBeDefined();
    expect((<any>config)._addDomainPrefix).toBeDefined();
    expect((<any>config)._language).toBeDefined();
  });

  it('should throw an error when "input" is undefined or otherwise return its value', async () => {
    const config = new JsonldContextGenerationServiceConfiguration();

    expect(() => config.input).toThrowError('Trying to access property "input" before it was set.');
    await config.createFromCli(params);
    expect(config.input).toBe('test.jsonld');
  });

  it('should throw an error when "output" is undefined or otherwise return its value', async () => {
    const config = new JsonldContextGenerationServiceConfiguration();

    expect(() => config.output).toThrowError('Trying to access property "output" before it was set.');
    await config.createFromCli(params);
    expect(config.output).toBe('context.jsonld');
  });

  it('should throw an error when "addDomainPrefix" is undefined or otherwise return its value', async () => {
    const config = new JsonldContextGenerationServiceConfiguration();

    expect(() => config.addDomainPrefix).toThrowError('Trying to access property "addDomainPrefix" before it was set.');
    await config.createFromCli(params);
    expect(config.addDomainPrefix).toBe(true);
  });

  it('should throw an error when "language" is undefined or otherwise return its value', async () => {
    const config = new JsonldContextGenerationServiceConfiguration();

    expect(() => config.language).toThrowError('Trying to access property "language" before it was set.');
    await config.createFromCli(params);
    expect(config.language).toBe('en');
  });
});
