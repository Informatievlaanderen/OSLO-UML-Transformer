/**
 * @group unit
 */
import fs from 'fs';
import fsp from 'fs/promises';
import { OutputFormat } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import * as N3 from 'n3';
import * as __ from 'node-fetch';
import { DataFactory } from 'rdf-data-factory';
import rdfParser from 'rdf-parse';
import streamifyString from 'streamify-string';
import * as _ from '../lib/utils/fetchFileOrUrl';
import { uniqueId } from '../lib/utils/uniqueId';

jest.mock('@oslo-flanders/core', () => {
  return {
    ...jest.requireActual('@oslo-flanders/core'),
    createN3Store: jest.fn(),
  };
});

describe('Util functions', () => {
  let store: N3.Store;
  const df: DataFactory = new DataFactory();

  function parseJsonld(data: any): Promise<RDF.Quad[]> {
    const textStream = streamifyString(JSON.stringify(data));

    return new Promise<RDF.Quad[]>((resolve, reject) => {
      const quads: RDF.Quad[] = [];
      rdfParser
        .parse(textStream, { contentType: OutputFormat.JsonLd })
        .on('data', (quad: RDF.Quad) => quads.push(quad))
        .on('error', (error: unknown) => reject(error))
        .on('end', () => resolve(quads));
    });
  }

  beforeEach(() => {
    store = new N3.Store();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch a URL and return a Buffer', async () => {
    jest
      .spyOn(__, 'default')
      .mockImplementation(() => Promise.resolve(new __.Response('')));
    expect(await _.fetchFileOrUrl('http://example.org')).toBeInstanceOf(Buffer);
    expect(await _.fetchFileOrUrl('https://example.org')).toBeInstanceOf(
      Buffer,
    );
  });

  it('should fetch a local file and return a Buffer', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs.Stats.prototype, 'isFile').mockImplementation(() => true);
    jest.spyOn(fsp, 'stat').mockReturnValue(Promise.resolve(new fs.Stats()));
    jest
      .spyOn(fsp, 'readFile')
      .mockReturnValue(Promise.resolve(Buffer.from('')));

    expect(await _.fetchFileOrUrl('file://example.ttl')).toBeInstanceOf(Buffer);
    expect(await _.fetchFileOrUrl('C:\\user\\docs\\file.ttl')).toBeInstanceOf(
      Buffer,
    );
  });

  it('should throw an error when a local file does not exist', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    await expect(
      async () => await _.fetchFileOrUrl('file://example.ttl'),
    ).rejects.toThrowError();
    await expect(
      async () => await _.fetchFileOrUrl('C:\\user\\docs\\file.ttl'),
    ).rejects.toThrowError();

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fsp, 'stat').mockReturnValue(Promise.resolve(new fs.Stats()));
    jest.spyOn(fs.Stats.prototype, 'isFile').mockImplementation(() => false);

    await expect(
      async () => await _.fetchFileOrUrl('file://example.ttl'),
    ).rejects.toThrowError();
    await expect(
      async () => await _.fetchFileOrUrl('C:\\user\\docs\\file.ttl'),
    ).rejects.toThrowError();
  });

  it('should generate a unique id', async () => {
    const guid = 'test-guid';
    const label = 'test-label';
    const id = 1;

    expect(uniqueId(guid, label, id)).toEqual(uniqueId(guid, label, id));
    expect(uniqueId(guid, label, id)).not.toEqual(uniqueId(guid, label, 2));
  });
});
