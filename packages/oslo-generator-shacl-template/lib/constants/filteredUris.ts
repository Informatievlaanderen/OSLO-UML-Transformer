import { ns } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';

/**
 * URIs that should be filtered out from SHACL shape generation
 */

export const FILTERED_URIS: RDF.NamedNode[] = [ns.rdfs('Literal')];

/**
 * Check if a URI should be filtered out from shape generation
 * @param uri The URI to check
 * @returns true if the URI should be filtered out
 */
export function shouldFilterUri(uri: RDF.NamedNode): boolean {
  return FILTERED_URIS.some((filteredUri) => uri.equals(filteredUri));
}
