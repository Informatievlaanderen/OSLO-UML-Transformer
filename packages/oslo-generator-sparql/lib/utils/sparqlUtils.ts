import type { QuadStore } from '@oslo-flanders/core';
import { ns, getPrefixes } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import type { SplittedUri } from '../types/Sparql';

export function findAllAttributes(
  subject: RDF.Term,
  attributeIds: RDF.Term[],
  store: QuadStore,
): RDF.Term[] {
  const parentIds = store.findObjects(subject, ns.rdfs('subClassOf'));

  attributeIds = [
    ...attributeIds,
    ...store.findSubjects(ns.rdfs('domain'), subject),
  ];

  for (const parentId of parentIds) {
    attributeIds = findAllAttributes(parentId, attributeIds, store);
  }

  return attributeIds;
}

export async function splitUri(uri: string): Promise<SplittedUri | undefined> {
  /* Extract prefix and element by finding the last occurrence of # or / */
  const hashIndex = uri.lastIndexOf('#');
  const slashIndex = uri.lastIndexOf('/');
  const splitIndex = Math.max(hashIndex, slashIndex);

  if (splitIndex > 0) {
    const prefixUri = uri.slice(0, Math.max(0, splitIndex + 1));
    const element = uri.replace(prefixUri, '');

    const prefixes = await getPrefixes();
    let prefixLabel;
    for (const [label, puri] of Object.entries(prefixes)) {
      if (puri === prefixUri) {
        prefixLabel = label;
        break;
      }
    }

    /* No known prefix found for URI */
    if (!prefixLabel) {
      return undefined;
    }

    return {
      prefix: prefixLabel,
      uri: prefixUri,
      element,
    };
  }

  /* Splitting failed */
  return undefined;
}
