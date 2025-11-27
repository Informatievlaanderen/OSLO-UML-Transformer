import type { QuadStore } from '@oslo-flanders/core';
import { ns } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';

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
