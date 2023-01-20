import type * as RDF from '@rdfjs/types';
import * as N3 from 'n3';
import rdfParser from 'rdf-parse';
import { fetchFileOrUrl } from './fetchFileOrUrl';

export async function createN3Store(fileOrUrl: string): Promise<N3.Store> {
  const store = new N3.Store();
  const buffer = await fetchFileOrUrl(fileOrUrl);
  const textStream = require('streamify-string')(buffer.toString());

  return new Promise<N3.Store>((resolve, reject) => {
    rdfParser.parse(textStream, { path: fileOrUrl })
      .on('data', (quad: RDF.Quad) => store.addQuad(quad))
      .on('error', (error: unknown) => reject(error))
      .on('end', () => resolve(store));
  });
}
