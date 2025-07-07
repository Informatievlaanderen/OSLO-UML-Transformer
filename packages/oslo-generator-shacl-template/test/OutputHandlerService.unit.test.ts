/**
 * @group unit
 */
import 'reflect-metadata';
import fs from 'fs';
import { Writable } from 'stream';
import { QuadStore , OutputFormat } from '@oslo-flanders/core';
import { DataFactory } from 'rdf-data-factory';
import rdfSerializer from "rdf-serialize";
import { ShaclTemplateGenerationServiceConfiguration }
  from '../lib/config/ShaclTemplateGenerationServiceConfiguration';
import { OutputHandlerService } from '../lib/OutputHandlerService';


jest.mock('@oslo-flanders/core', () => {
  return {
    ...jest.requireActual('@oslo-flanders/core'),
    createN3Store: jest.fn(),
  };
});

describe('OutputHandlerService', () => {
  let service: OutputHandlerService;
  let config: ShaclTemplateGenerationServiceConfiguration;
  let store: QuadStore;
  let df: DataFactory;

  const params: any = {
    outputFormat: OutputFormat.turtle,
    output: 'output.ttl',
    mode: 'grouped',
    constraint: [],
  };

  beforeEach(async () => {
    config = new ShaclTemplateGenerationServiceConfiguration();
    await config.createFromCli(params);

    store = new QuadStore();
    df = new DataFactory();
    store.addQuad(df.quad(df.namedNode('s'), df.namedNode('p'), df.namedNode('o'), df.namedNode('baseQuadsGraph')));
    service = new OutputHandlerService(config);
  });

  it('should write to a file', async () => {
    const serializerSpy = jest.spyOn(rdfSerializer, 'serialize')
    const mockStream = new Writable({
      write(chunk, encoding, callback) {
        callback();
      },
    });

    const createWriteStreamSpy = jest.spyOn(fs, 'createWriteStream').mockReturnValue(<any>mockStream);

    await service.write(store);
    expect(serializerSpy).toHaveBeenCalled()
    expect(createWriteStreamSpy).toHaveBeenCalledWith('output.ttl');
  });

  it('should write to the default file is no output is provided', async () => {
    params.output = '';
    params.outputFormat = OutputFormat.JsonLd;
    await config.createFromCli(params);

    const mockStream = new Writable({
      write(chunk, encoding, callback) {
        callback();
      },
    });

    const createWriteStreamSpy = jest.spyOn(fs, 'createWriteStream').mockReturnValue(<any>mockStream);
    await service.write(store);
    expect(createWriteStreamSpy).toHaveBeenCalledWith('shacl.jsonld');
  })

  it('should get the file extension', () => {
    (<any>config)._outputFormat = OutputFormat.JsonLd;
    expect((<any>service).getFileExtension()).toBe('jsonld');

    (<any>config)._outputFormat = OutputFormat.turtle;
    expect((<any>service).getFileExtension()).toBe('ttl');

    (<any>config)._outputFormat = OutputFormat.ntriples;
    expect((<any>service).getFileExtension()).toBe('nt');

    (<any>config)._outputFormat = OutputFormat.unsupported;
    expect(() => (<any>service).getFileExtension()).toThrow(new Error(`Output format '${config.outputFormat}' is not supported.`));
  });
})