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

function removeCaret(text: string): string {
  return text.replace(/^\^/u, '');
}

export function toPascalCase(text: string): string {
  return removeCaret(text)
    .replace(/(?:^\w|[A-Z]|\b\w)/gu, (word: string, index: number) =>
      word.toUpperCase(),
    )
    .replace(/\s+/gu, '');
}

export function toCamelCase(text: string): string {
  return removeCaret(text)
    .replace(/(?:^\w|[A-Z]|\b\w)/gu, (word: string, index: number) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase(),
    )
    .replace(/\s+/gu, '');
}

