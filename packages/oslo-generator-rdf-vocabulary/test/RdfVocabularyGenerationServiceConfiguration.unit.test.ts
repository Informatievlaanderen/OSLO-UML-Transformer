/**
 * @group unit
 */
import 'reflect-metadata';
import { RdfVocabularyGenerationServiceConfiguration } from '../lib/config/RdfVocabularyGenerationServiceConfiguration';

describe('RdfVocabularyGenerationServiceConfiguration', () => {
  let params: any;

  beforeAll(() => {
    params = {
      input: 'test.jsonld',
      output: 'output.jsonld',
      language: 'en',
      contentType: 'application/ld+json',
    };
  });

  it('should set its variables using the parameters received from the CLI', async () => {
    const config = new RdfVocabularyGenerationServiceConfiguration();
    await config.createFromCli(params);

    expect((<any>config)._input).toBeDefined();
    expect((<any>config)._output).toBeDefined();
    expect((<any>config)._contentType).toBeDefined();
    expect((<any>config)._language).toBeDefined();
  });

  it('should throw an error when "input" is undefined or otherwise return its value', async () => {
    const config = new RdfVocabularyGenerationServiceConfiguration();

    expect(() => config.input).toThrowError('Trying to access property "input" before it was set.');
    await config.createFromCli(params);
    expect(config.input).toBe('test.jsonld');
  });

  it('should throw an error when "output" is undefined or otherwise return its value', async () => {
    const config = new RdfVocabularyGenerationServiceConfiguration();

    expect(() => config.output).toThrowError('Trying to access property "output" before it was set.');
    await config.createFromCli(params);
    expect(config.output).toBe('output.jsonld');
  });

  it('should throw an error when "language" is undefined or otherwise return its value', async () => {
    const config = new RdfVocabularyGenerationServiceConfiguration();

    expect(() => config.language).toThrowError('Trying to access property "language" before it was set.');
    await config.createFromCli(params);
    expect(config.language).toBe('en');
  });

  it('should throw an error when "contentType" is undefined or otherwise return its value', async () => {
    const config = new RdfVocabularyGenerationServiceConfiguration();

    expect(() => config.contentType).toThrowError('Trying access property "contentType" before it was set.');
    await config.createFromCli(params);
    expect(config.contentType).toBe('application/ld+json');
  });
});
