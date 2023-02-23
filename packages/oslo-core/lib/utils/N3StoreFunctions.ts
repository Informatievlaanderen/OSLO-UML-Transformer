import type * as RDF from '@rdfjs/types';
import * as N3 from 'n3';
import rdfParser from 'rdf-parse';
import { fetchFileOrUrl } from './fetchFileOrUrl';
import { ns } from './namespaces';

/**
 * Given a local file, it is parsed and added to an in-memory quad store
 * @param fileOrUrl Local path of the input file
 * @returns A N3 quad store
 */
export async function createN3Store(file: string): Promise<N3.Store> {
  const store = new N3.Store();
  const buffer = await fetchFileOrUrl(file);
  const textStream = require('streamify-string')(buffer.toString());

  return new Promise<N3.Store>((resolve, reject) => {
    rdfParser.parse(textStream, { path: file })
      .on('data', (quad: RDF.Quad) => store.addQuad(quad))
      .on('error', (error: unknown) => reject(error))
      .on('end', () => resolve(store));
  });
}

/**
 * Find the subject of the statement that matches the given subject, predicate and object
 * @param statementSubject The subject to match the statement subject
 * @param statementPredicate The predicate to match the statement predicate
 * @param statementObject The object to match the statement object
 * @param store An N3 quad store
 * @returns an RDF.Term or undefined if none found
 */
export function getTargetStatementId(
  statementSubject: RDF.Term,
  statementPredicate: RDF.Term,
  statementObject: RDF.Term,
  store: N3.Store,
): RDF.Term | undefined {
  const statementIds = store.getSubjects(ns.rdf('type'), ns.rdf('Statement'), null);
  const statementSubjectPredicateSubjects = store.getSubjects(ns.rdf('subject'), statementSubject, null);
  const statementPredicatePredicateSubjects = store.getSubjects(ns.rdf('predicate'), statementPredicate, null);
  const statementObjectPredicateSubjects = store.getSubjects(ns.rdf('object'), statementObject, null);

  const targetIds = statementIds
    .filter(x => statementSubjectPredicateSubjects.some(y => y.value === x.value))
    .filter(x => statementPredicatePredicateSubjects.some(y => y.value === x.value))
    .filter(x => statementObjectPredicateSubjects.some(y => y.value === x.value));

  if (targetIds.length > 1) {
    throw new Error(`Found multiple statements with subject "${statementSubject.value}", predicate "${statementPredicate.value}" and object "${statementObject.value}".`);
  }

  return targetIds.shift();
}

/**
 * For a given subject, the quad store is queried to find the assigned URI
 * @param subject The subject for which the assigned URI is to be retrieved
 * @param store The quad store
 * @returns An RDF.NamedNode or undefined if not found
 */
export function getAssignedUri(subject: RDF.Term, store: N3.Store): RDF.Term | undefined {
  return store.getObjects(subject, ns.example('assignedUri'), null).shift();
}

/**
 * Finds the assigned URI in rdf:Statements
 * @param subject The statement subject
 * @param predicate The statement predicate
 * @param object The statement object for which the assigned URI must be found
 * @param store A N3 quad store
 * @returns An RDF.Term or undefined if not found
 */
export function getAssignedUriViaStatements(
  subject: RDF.Term,
  predicate: RDF.Term,
  object: RDF.Term,
  store: N3.Store,
): RDF.Term | undefined {
  const statementId = getTargetStatementId(subject, predicate, object, store);

  if (!statementId) {
    return undefined;
  }

  return getAssignedUri(statementId, store);
}

/**
 * Find all rdfs:labels for a given subject
 * @param subject The RDF.Term to find the rdfs:labels for
 * @param store A N3 quad store
 * @returns An array of RDF.Literals
 */
export function getLabels(subject: RDF.Term, store: N3.Store): RDF.Literal[] {
  return <RDF.Literal[]>store.getObjects(subject, ns.rdfs('label'), null);
}

/**
 * Finds the rdfs:label whose language tag matches the given language
 * @param subject The RDF.Term to find the rdfs:label for
 * @param store A N3 quad store
 * @param language A language tag
 * @returns An RDF.Literal or undefined if not found
 */
export function getLabel(subject: RDF.Term, store: N3.Store, language?: string): RDF.Literal | undefined {
  return getLabels(subject, store).find(x => x.language === (language || ''));
}

/**
 * Finds the rdfs:label for an RDF.Term in rdf:Statements
 * @param subject The statement subject
 * @param predicate The statement predicate
 * @param object The statement object for which the label must be found
 * @param store A N3 quad store
 * @param language A language tag
 * @returns An RDF.Literal or undefined if not found
 */
export function getLabelViaStatements(
  subject: RDF.Term,
  predicate: RDF.Term,
  object: RDF.Term,
  store: N3.Store,
  language: string,
): RDF.Literal | undefined {
  const statementId = getTargetStatementId(subject, predicate, object, store);

  if (!statementId) {
    return undefined;
  }

  const label = getLabel(statementId, store, language);
  return label || getLabel(statementId, store);
}

/**
 * Find all rdfs:comments for a given subject
 * @param subject The RDF.Term to find the rdfs:comments for
 * @param store A N3 quad store
 * @returns An array of RDF.Literals
 */
export function getDefinitions(subject: RDF.Term, store: N3.Store): RDF.Literal[] {
  return <RDF.Literal[]>store.getObjects(subject, ns.rdfs('comment'), null);
}

/**
 * Finds the rdfs:comment whose language tag matches the given language
 * @param subject The RDF.Term to find the rdfs:comment for
 * @param store A N3 quad store
 * @param language A language tag
 * @returns An RDF.Literal or undefined if not found
 */
export function getDefinition(subject: RDF.Term, store: N3.Store, language?: string): RDF.Literal | undefined {
  return getDefinitions(subject, store).find(x => x.language === (language || ''));
}

/**
 * Finds the rdfs:comment for an RDF.Term in rdf:Statements
 * @param subject The statement subject
 * @param predicate The statement predicate
 * @param object The statement object for which the definition must be found
 * @param store A N3 quad store
 * @param language A language tag
 * @returns An RDF.Literal or undefined if not found
 */
export function getDefinitionViaStatements(
  subject: RDF.Term,
  predicate: RDF.Term,
  object: RDF.Term,
  store: N3.Store,
  language: string,
): RDF.Literal | undefined {
  const statementId = getTargetStatementId(subject, predicate, object, store);

  if (!statementId) {
    return undefined;
  }

  const definition = getDefinition(statementId, store, language);
  return definition || getDefinition(statementId, store);
}

/**
 * Finds all the rdfs:subClassOf of a given RDF.Term
 * @param subject the RDF.Term to find the parents of
 * @param store A N3 quad store
 * @returns An array of RDF.Terms
 */
export function getParentsOfClass(subject: RDF.Term, store: N3.Store): RDF.Term[] {
  return store.getObjects(subject, ns.rdfs('subClassOf'), null);
}

/**
 * Finds the rdfs:subPropertyOf of a given RDF.Term
 * @param subject The RDF.Term to find the parent of
 * @param store A N3 quad store
 * @returns An RDF.Term or undefined if not found
 */
export function getParentOfProperty(subject: RDF.Term, store: N3.Store): RDF.Term | undefined {
  return store.getObjects(subject, ns.rdfs('subPropertyOf'), null).shift();
}

/**
 * Finds the rdfs:range of a given RDF.Term
 * @param subject The RDF.Term to find the range of
 * @param store A N3 quad store
 * @returns An RDF.Term or undefined if not found
 */
export function getRange(subject: RDF.Term, store: N3.Store): RDF.Term | undefined {
  return store.getObjects(subject, ns.rdfs('range'), null).shift();
}

/**
 * Finds the rdfs:domain of a given RDF.Term
 * @param subject The RDF.Term to find the domain of
 * @param store A N3 quad store
 * @returns An RDF.Term or undefined if not found
 */
export function getDomain(subject: RDF.Term, store: N3.Store): RDF.Term | undefined {
  return store.getObjects(subject, ns.rdfs('domain'), null).shift();
}

/**
 * Finds all the vann:usageNotes of a given RDF.Term
 * @param subject The RDF.Term to find the usage notes for
 * @param store A N3 quad store
 * @returns An array of RDF.Literals
 */
export function getUsageNotes(subject: RDF.Term, store: N3.Store): RDF.Literal[] {
  return <RDF.Literal[]>store.getObjects(subject, ns.vann('usageNote'), null);
}

/**
 * Finds the vann:usageNote of which the language tag matches the given language
 * @param subject The RDF.Term to find the usage note for
 * @param store A N3 quad store
 * @param language A language tag
 * @returns An RDF.Literal or undefined if not found
 */
export function getUsageNote(subject: RDF.Term, store: N3.Store, language?: string): RDF.Literal | undefined {
  return getUsageNotes(subject, store).find(x => x.language === (language || ''));
}

/**
 * Finds the vann:usageNote for an RDF.Term in rdf:Statements
 * @param subject The statement subject
 * @param predicate The statement predicate
 * @param object The statement object for which the usage note must be found
 * @param store A N3 quad store
 * @param language A language tag
 * @returns An RDF.Literal or undefined if not found
 */
export function getUsageNoteViaStatements(
  subject: RDF.Term,
  predicate: RDF.Term,
  object: RDF.Term,
  store: N3.Store,
  language: string,
): RDF.Literal | undefined {
  const statementId = getTargetStatementId(subject, predicate, object, store);

  if (!statementId) {
    return undefined;
  }

  const usageNote = getUsageNote(statementId, store, language);
  return usageNote || getUsageNote(statementId, store);
}
