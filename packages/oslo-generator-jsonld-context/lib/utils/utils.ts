import { ns } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import type * as N3 from 'n3';

export function toPascalCase(text: string): string {
  return text.replace(/(?:^\w|[A-Z]|\b\w)/gu, (word: string, index: number) => word.toUpperCase()).replace(/\s+/gu, '');
}

export function toCamelCase(text: string): string {
  return text.replace(/(?:^\w|[A-Z]|\b\w)/gu, (word: string, index: number) =>
    index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/gu, '');
}

export function alphabeticalSort(source: [string, any][]): [string, any][] {
  return source.sort(([key1, value1], [key2, value2]) => key1.localeCompare(key2));
}

export function getLabel(subject: RDF.Quad_Subject, language: string, store: N3.Store): RDF.Quad_Object | undefined {
  return store.getObjects(subject, ns.rdfs('label'), null)
    .find(x => (<RDF.Literal>x).language === language);
}

export function getAssignedUri(subject: RDF.Quad_Subject, store: N3.Store): RDF.Quad_Object | undefined {
  return store.getObjects(subject, ns.example('assignedUri'), null).shift();
}
