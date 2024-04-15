import type * as RDF from '@rdfjs/types';
import rdfParser from 'rdf-parse';
import streamifyString from 'streamify-string'

export function parseJsonld(data: any): Promise<RDF.Quad[]> {
  const textStream = streamifyString(JSON.stringify(data));

  return new Promise<RDF.Quad[]>((resolve, reject) => {
    const quads: RDF.Quad[] = [];
    rdfParser.parse(textStream, { contentType: 'application/ld+json' })
      .on('data', (quad: RDF.Quad) => quads.push(quad))
      .on('error', (error: unknown) => reject(error))
      .on('end', () => resolve(quads));
  });
}