import type * as RDF from '@rdfjs/types';
import type { QuadStore } from '@oslo-core/store/QuadStore';
import { ns } from '@oslo-core/utils/namespaces';

export function getApplicationProfileLabel(
    subject: RDF.Term,
    store: QuadStore,
    language: string | null = null,
): RDF.Literal | undefined {
    const labels = store.getLabels(subject);

    if (labels.some(x => x.predicate.equals(ns.oslo('apLabel')))) {
        return <RDF.Literal>labels
            .find(x => x.predicate.equals(ns.oslo('apLabel')) &&
                (<RDF.Literal>x.object).language === (language || ''))?.object
    }

    if (labels.some(x => x.predicate.equals(ns.oslo('vocLabel')))) {
        return <RDF.Literal>
            labels.find(x => x.predicate.equals(ns.oslo('vocLabel')) &&
                (<RDF.Literal>x.object).language === (language || ''))?.object;
    }
    return <RDF.Literal | undefined>labels.find(x => x.predicate.equals(ns.oslo('diagramLabel')))?.object;
}

export function getVocabularyLabel(
    subject: RDF.Term,
    store: QuadStore,
    language: string | null = null,
): RDF.Literal | undefined {
    const labels = store.getLabels(subject);

    if (labels.some(x => x.predicate.equals(ns.oslo('vocLabel')))) {
        return <RDF.Literal>labels
            .find(x => x.predicate.equals(ns.oslo('vocLabel')) &&
                (<RDF.Literal>x.object).language === (language || ''))?.object;
    }
    return <RDF.Literal | undefined>labels.find(x => x.predicate.equals(ns.oslo('diagramLabel')))?.object;
}

export function getApplicationProfileDefinition(
    subject: RDF.Term,
    store: QuadStore,
    language: string | null = null,
): RDF.Literal | undefined {
    const definitions = store.getDefinitions(subject);

    if (definitions.some(x => x.predicate.equals(ns.oslo('apDefinition')))) {
        return <RDF.Literal>definitions
            .find(x => x.predicate.equals(ns.oslo('apDefinition')) &&
                (<RDF.Literal>x.object).language === (language || ''))?.object;
    }

    if (definitions.some(x => x.predicate.equals(ns.oslo('vocDefinition')))) {
        return <RDF.Literal>definitions
            .find(x => x.predicate.equals(ns.oslo('vocDefinition')) &&
                (<RDF.Literal>x.object).language === (language || ''))?.object;
    }

    return undefined;
}

export function getVocabularyDefinition(
    subject: RDF.Term,
    store: QuadStore,
    language: string | null = null,
): RDF.Literal | undefined {
    const definitions = store.getDefinitions(subject);

    if (definitions.some(x => x.predicate.equals(ns.oslo('vocDefinition')))) {
        return <RDF.Literal>definitions
            .find(x => x.predicate.equals(ns.oslo('vocDefinition')) &&
                (<RDF.Literal>x.object).language === (language || ''))?.object;
    }

    return undefined;
}

export function getApplicationProfileUsageNote(
    subject: RDF.Term,
    store: QuadStore,
    language: string | null = null,
): RDF.Literal | undefined {
    const usageNotes = store.getUsageNotes(subject);

    if (usageNotes.some(x => x.predicate.equals(ns.oslo('apUsageNote')))) {
        return <RDF.Literal>usageNotes
            .find(x => x.predicate.equals(ns.oslo('apUsageNote')) &&
                (<RDF.Literal>x.object).language === (language || ''))?.object;
    }

    if (usageNotes.some(x => x.predicate.equals(ns.oslo('vocUsageNote')))) {
        return <RDF.Literal>usageNotes
            .find(x => x.predicate.equals(ns.oslo('vocUsageNote')) &&
                (<RDF.Literal>x.object).language === (language || ''))?.object;
    }

    return undefined;
}

export function getVocabularyUsageNote(
    subject: RDF.Term,
    store: QuadStore,
    language: string | null = null,
): RDF.Literal | undefined {
    const usageNotes = store.getUsageNotes(subject);

    if (usageNotes.some(x => x.predicate.equals(ns.oslo('vocUsageNote')))) {
        return <RDF.Literal>usageNotes
            .find(x => x.predicate.equals(ns.oslo('vocUsageNote')) &&
                (<RDF.Literal>x.object).language === (language || ''))?.object;
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

export function getCodelist(
    subject: RDF.Term,
    store: QuadStore,
): string | undefined {
    return store.findObject(subject, ns.oslo('codelist'))?.value;
}

