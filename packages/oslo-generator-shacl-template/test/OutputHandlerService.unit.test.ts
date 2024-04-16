/**
 * @group unit
 */
import 'reflect-metadata';
import fs from 'fs';
import { Writable } from 'stream';
import { QuadStore } from '@oslo-flanders/core';
import { DataFactory } from 'rdf-data-factory';
import rdfSerializer from "rdf-serialize";
import { ShaclTemplateGenerationServiceConfiguration }
  from '../lib/config/ShaclTemplateGenerationServiceConfiguration';
import { OutputHandlerService } from '../lib/OutputHandlerService';

describe('OutputHandlerService', () => {
  let service: OutputHandlerService;
  let config: ShaclTemplateGenerationServiceConfiguration;
  let store: QuadStore;
  let df: DataFactory;

  const params: any = {
    outputFormat: 'text/turtle',
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
    params.outputFormat = 'application/ld+json';
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
    (<any>config)._outputFormat = 'application/ld+json';
    expect((<any>service).getFileExtension()).toBe('jsonld');

    (<any>config)._outputFormat = 'text/turtle';
    expect((<any>service).getFileExtension()).toBe('ttl');

    (<any>config)._outputFormat = 'application/n-triples';
    expect((<any>service).getFileExtension()).toBe('nt');

    (<any>config)._outputFormat = 'unsupported/format';
    expect(() => (<any>service).getFileExtension()).toThrow(new Error(`Output format '${config.outputFormat}' is not supported.`));
  });
})