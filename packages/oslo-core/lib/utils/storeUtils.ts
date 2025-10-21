import type * as RDF from '@rdfjs/types';
import type { DataFactory } from 'rdf-data-factory';
import type { QuadStore } from '../store/QuadStore';
import { ns } from './namespaces';

export function getApplicationProfileLabel(
  subject: RDF.Term,
  store: QuadStore,
  language: string | null = null,
): RDF.Literal | undefined {
  const labels = store.getLabels(subject);

  if (labels.some((x) => x.predicate.equals(ns.oslo('apLabel')))) {
    return <RDF.Literal>(
      labels.find(
        (x) =>
          x.predicate.equals(ns.oslo('apLabel')) &&
          (<RDF.Literal>x.object).language === (language || ''),
      )?.object
    );
  }

  if (labels.some((x) => x.predicate.equals(ns.oslo('vocLabel')))) {
    return <RDF.Literal>(
      labels.find(
        (x) =>
          x.predicate.equals(ns.oslo('vocLabel')) &&
          (<RDF.Literal>x.object).language === (language || ''),
      )?.object
    );
  }
  return <RDF.Literal | undefined>(
    labels.find((x) => x.predicate.equals(ns.oslo('diagramLabel')))?.object
  );
}

export function getVocabularyLabel(
  subject: RDF.Term,
  store: QuadStore,
  language: string | null = null,
): RDF.Literal | undefined {
  const labels = store.getLabels(subject);

  if (labels.some((x) => x.predicate.equals(ns.oslo('vocLabel')))) {
    return <RDF.Literal>(
      labels.find(
        (x) =>
          x.predicate.equals(ns.oslo('vocLabel')) &&
          (<RDF.Literal>x.object).language === (language || ''),
      )?.object
    );
  }
  return <RDF.Literal | undefined>(
    labels.find((x) => x.predicate.equals(ns.oslo('diagramLabel')))?.object
  );
}

export function getApplicationProfileDefinition(
  subject: RDF.Term,
  store: QuadStore,
  language: string | null = null,
): RDF.Literal | undefined {
  const definitions = store.getDefinitions(subject);

  if (definitions.some((x) => x.predicate.equals(ns.oslo('apDefinition')))) {
    return <RDF.Literal>(
      definitions.find(
        (x) =>
          x.predicate.equals(ns.oslo('apDefinition')) &&
          (<RDF.Literal>x.object).language === (language || ''),
      )?.object
    );
  }

  if (definitions.some((x) => x.predicate.equals(ns.oslo('vocDefinition')))) {
    return <RDF.Literal>(
      definitions.find(
        (x) =>
          x.predicate.equals(ns.oslo('vocDefinition')) &&
          (<RDF.Literal>x.object).language === (language || ''),
      )?.object
    );
  }

  return undefined;
}

export function getVocabularyDefinition(
  subject: RDF.Term,
  store: QuadStore,
  language: string | null = null,
): RDF.Literal | undefined {
  const definitions = store.getDefinitions(subject);

  if (definitions.some((x) => x.predicate.equals(ns.oslo('vocDefinition')))) {
    return <RDF.Literal>(
      definitions.find(
        (x) =>
          x.predicate.equals(ns.oslo('vocDefinition')) &&
          (<RDF.Literal>x.object).language === (language || ''),
      )?.object
    );
  }

  return undefined;
}

export function getApplicationProfileUsageNote(
  subject: RDF.Term,
  store: QuadStore,
  language: string | null = null,
): RDF.Literal | undefined {
  const usageNotes = store.getUsageNotes(subject);

  if (usageNotes.some((x) => x.predicate.equals(ns.oslo('apUsageNote')))) {
    return <RDF.Literal>(
      usageNotes.find(
        (x) =>
          x.predicate.equals(ns.oslo('apUsageNote')) &&
          (<RDF.Literal>x.object).language === (language || ''),
      )?.object
    );
  }

  if (usageNotes.some((x) => x.predicate.equals(ns.oslo('vocUsageNote')))) {
    return <RDF.Literal>(
      usageNotes.find(
        (x) =>
          x.predicate.equals(ns.oslo('vocUsageNote')) &&
          (<RDF.Literal>x.object).language === (language || ''),
      )?.object
    );
  }

  return undefined;
}

export function getVocabularyUsageNote(
  subject: RDF.Term,
  store: QuadStore,
  language: string | null = null,
): RDF.Literal | undefined {
  const usageNotes = store.getUsageNotes(subject);

  if (usageNotes.some((x) => x.predicate.equals(ns.oslo('vocUsageNote')))) {
    return <RDF.Literal>(
      usageNotes.find(
        (x) =>
          x.predicate.equals(ns.oslo('vocUsageNote')) &&
          (<RDF.Literal>x.object).language === (language || ''),
      )?.object
    );
  }

  return undefined;
}

export function getMinCount(
  subject: RDF.Term,
  store: QuadStore,
): string | undefined {
  return store.findObject(subject, ns.shacl('minCount'))?.value;
}

export function getMaxCount(
  subject: RDF.Term,
  store: QuadStore,
): string | undefined {
  return store.findObject(subject, ns.shacl('maxCount'))?.value;
}

export function createList(
  items: RDF.Term[],
  store: QuadStore,
  df: DataFactory,
): RDF.BlankNode | RDF.NamedNode {
  const list: RDF.BlankNode[] | RDF.NamedNode[] = [df.blankNode()];
  const quads: RDF.Quad[] = [];

  /* Empty list has a single NamedNode RDF:nil */
  if (items.length === 0) return df.namedNode(ns.rdf('nil'));

  for (const [i, value] of items.entries()) {
    const subject: RDF.Term = list[i];
    const object: RDF.Term = value;

    /* Items must be identifiers */
    if (object.termType !== 'NamedNode' && object.termType !== 'BlankNode')
      continue;

    /* Current list item */
    quads.push(df.quad(subject, ns.rdf('first'), object));

    if (i === items.length - 1) {
      /* End of list */
      quads.push(
        df.quad(
          subject,
          ns.rdf('rest'),
          ns.rdf('nil'),
        ),
      );
    } else {
      /* Next item of the list */
      list.push(df.blankNode());
      const nextSubject: RDF.Term = list[i + 1];

      /* Items must be identifiers */
      if (nextSubject.termType !== 'BlankNode') continue;

      quads.push(
        df.quad(subject, ns.rdf('rest'), nextSubject),
      );
    }
  }

  store.addQuads(quads);

  return list[0];
}
