/**
 * @group unit
 */
import 'reflect-metadata';
import { QuadStore, OutputFormat, VoidLogger } from '@oslo-flanders/core';
import { DataFactory } from 'rdf-data-factory';
import { RmlGenerationServiceConfiguration } from '../lib/config/RmlGenerationServiceConfiguration';
import { OutputHandlerService } from '../lib/OutputHandlerService';

jest.mock('@oslo-flanders/core', () => {
  return {
    ...jest.requireActual('@oslo-flanders/core'),
    createN3Store: jest.fn(),
  };
});

describe('OutputHandlerService', () => {
  let service: OutputHandlerService;
  let config: RmlGenerationServiceConfiguration;
  let store: QuadStore;
  let logger: VoidLogger;
  let df: DataFactory;

  const params: any = {
    input: 'input.jsonld',
    outputFormat: OutputFormat.turtle,
    output: 'mappingsDirectory',
    language: 'nl',
  };

  beforeEach(async () => {
    config = new RmlGenerationServiceConfiguration();
    await config.createFromCli(params);

    logger = new VoidLogger();
    store = new QuadStore();
    df = new DataFactory();
    store.addQuad(
      df.quad(
        df.namedNode('s'),
        df.namedNode('p'),
        df.namedNode('o'),
        df.namedNode('baseQuadsGraph'),
      ),
    );
    service = new OutputHandlerService(logger, config);
  });

  it('should get the file extension', () => {
    (<any>config)._outputFormat = OutputFormat.JsonLd;
    expect((<any>service).getFileExtension()).toBe('rml.jsonld');

    (<any>config)._outputFormat = OutputFormat.turtle;
    expect((<any>service).getFileExtension()).toBe('rml.ttl');

    (<any>config)._outputFormat = OutputFormat.ntriples;
    expect((<any>service).getFileExtension()).toBe('rml.nt');

    (<any>config)._outputFormat = OutputFormat.unsupported;
    expect(() => (<any>service).getFileExtension()).toThrow(
      new Error(`Output format '${config.outputFormat}' is not supported.`),
    );
  });
});
