/**
 * @group unit
 */
import 'reflect-metadata';
import { JsonWebuniversumGenerationServiceConfiguration }
    from '../lib/config/JsonWebuniversumGenerationServiceConfiguration';

describe('JsonWebuniversumGenerationServiceConfiguration', () => {
    let params: any;

    beforeEach(() => {
        params = {
            input: 'test.jsonld',
            output: 'config.json',
            language: 'en',
            apTemplateMetadata: 'ap-markdown.md',
            vocTemplateMetadata: 'voc-markdown.md',
        };
    });

    it('should set its variables using the parameters received from the CLI', async () => {
        const config = new JsonWebuniversumGenerationServiceConfiguration();
        await config.createFromCli(params);

        expect((<any>config)._input).toBeDefined();
        expect((<any>config)._output).toBeDefined();
        expect((<any>config)._language).toBeDefined();
        expect((<any>config)._apTemplateMetadata).toBeDefined();
        expect((<any>config)._vocTemplateMetadata).toBeDefined();
    });

    it('should throw an error when "input" is undefined or otherwise return its value', async () => {
        const config = new JsonWebuniversumGenerationServiceConfiguration();

        expect(() => config.input).toThrow(new Error('Trying to access "input" before it was set.'));
        await config.createFromCli(params);
        expect(config.input).toBe('test.jsonld');
    });

    it('should throw an error when "output" is undefined or otherwise return its value', async () => {
        const config = new JsonWebuniversumGenerationServiceConfiguration();

        expect(() => config.output).toThrow(new Error('Trying to access "output" before it was set.'));
        await config.createFromCli(params);
        expect(config.output).toBe('config.json');
    });

    it('should throw an error when "language" is undefined or otherwise return its value', async () => {
        const config = new JsonWebuniversumGenerationServiceConfiguration();

        expect(() => config.language).toThrow(new Error('Trying to access "language" before it was set.'));
        await config.createFromCli(params);
        expect(config.language).toBe('en');
    });

    it('should throw an error when "apTemplateMetadata" is undefined or otherwise return its value', async () => {
        const config = new JsonWebuniversumGenerationServiceConfiguration();

        expect(() => config.apTemplateMetadata)
            .toThrow(new Error('Trying to access "apTemplateMetadata" before it was set.'));
        await config.createFromCli(params);
        expect(config.apTemplateMetadata).toBe('ap-markdown.md');
    });

    it('should throw an error when "vocTemplateMetadata" is undefined or otherwise return its value', async () => {
        const config = new JsonWebuniversumGenerationServiceConfiguration();

        expect(() => config.vocTemplateMetadata)
            .toThrow(new Error('Trying to access "vocTemplateMetadata" before it was set.'));
        await config.createFromCli(params);
        expect(config.vocTemplateMetadata).toBe('voc-markdown.md');
    });

})