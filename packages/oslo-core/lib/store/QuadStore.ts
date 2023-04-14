import type * as RDF from '@rdfjs/types';
import { injectable } from 'inversify';
import * as N3 from 'n3';
import rdfParser from 'rdf-parse';
import { fetchFileOrUrl } from '../utils/fetchFileOrUrl';
import { ns } from '../utils/namespaces';

@injectable()
export class QuadStore {
  private readonly store: N3.Store;

  public constructor() {
    this.store = new N3.Store();
  }

  public addQuads(quads: RDF.Quad[]): void {
    this.store.addQuads(quads);
  }

  public addQuad(quad: RDF.Quad): void {
    this.store.addQuad(quad);
  }

  public async addQuadsFromFile(file: string): Promise<void> {
    const buffer = await fetchFileOrUrl(file);
    const textStream = require('streamify-string')(buffer.toString());

    return new Promise<void>((resolve, reject) => {
      rdfParser.parse(textStream, { path: file })
        .on('data', (quad: RDF.Quad) => this.store.addQuad(quad))
        .on('error', (error: unknown) => reject(error))
        .on('end', () => resolve());
    });
  }

  public findQuads(subject: RDF.Term | null, predicate: RDF.Term | null, object: RDF.Term | null): RDF.Quad[] {
    return this.store.getQuads(subject, predicate, object, null);
  }

  public findQuad(subject: RDF.Term | null, predicate: RDF.Term | null, object: RDF.Term | null): RDF.Quad | undefined {
    return this.findQuads(subject, predicate, object).shift();
  }

  public findSubjects(predicate: RDF.Term, object: RDF.Term): RDF.Term[] {
    return <RDF.Term[]>this.store.getSubjects(predicate, object, null);
  }

  public findSubject(predicate: RDF.Term, object: RDF.Term): RDF.Term | undefined {
    return this.findSubjects(predicate, object).shift();
  }

  public findObjects(subject: RDF.Term, predicate: RDF.Term): RDF.Term[] {
    return <RDF.Term[]>this.store.getObjects(subject, predicate, null);
  }

  public findObject(subject: RDF.Term, predicate: RDF.Term): RDF.Term | undefined {
    return this.findObjects(subject, predicate).shift();
  }

  /**
   * Finds the subject where predicate is 'rdf:type' and object 'example:Package'
   * @returns a RDF.NamedNode or undefined
   */
  public getPackageId(): RDF.NamedNode | undefined {
    return <RDF.NamedNode | undefined>this.store.getSubjects(ns.rdf('type'), ns.example('Package'), null).shift();
  }

  /**
   * Finds all subjects where predicate is 'rdf:type' and object 'owl:Class'
   * @returns an array of RDF.NamedNodes
   */
  public getClassIds(): RDF.NamedNode[] {
    return <RDF.NamedNode[]>this.store.getSubjects(ns.rdf('type'), ns.owl('Class'), null);
  }

  /**
 * Finds all subjects where predicate is 'rdf:type' and object 'owl:DatatypeProperty'
 * @returns an array of RDF.NamedNodes
 */
  public getDatatypePropertyIds(): RDF.NamedNode[] {
    return <RDF.NamedNode[]>this.store.getSubjects(ns.rdf('type'), ns.owl('DatatypeProperty'), null);
  }

  /**
 * Finds all subjects where predicate is 'rdf:type' and object 'owl:ObjectProperty'
 * @returns an array of RDF.NamedNodes
 */
  public getObjectPropertyIds(): RDF.NamedNode[] {
    return <RDF.NamedNode[]>this.store.getSubjects(ns.rdf('type'), ns.owl('ObjectProperty'), null);
  }

  /**
   * For a given subject, the quad store is queried to find the assigned URI
   * @param subject The subject for which the assigned URI is to be retrieved
   * @param store The quad store
   * @returns An RDF.NamedNode or undefined if not found
   */
  public getAssignedUri(subject: RDF.Term): RDF.NamedNode | undefined {
    return <RDF.NamedNode | undefined>this.store.getObjects(subject, ns.example('assignedUri'), null).shift();
  }

  /**
   * Find all rdfs:labels for a given subject
   * @param subject The RDF.Term to find the rdfs:labels for
   * @param store A N3 quad store
   * @returns An array of RDF.Literals
   */
  public getLabels(subject: RDF.Term): RDF.Literal[] {
    return <RDF.Literal[]>this.store.getObjects(subject, ns.rdfs('label'), null);
  }

  /**
   * Finds the rdfs:label whose language tag matches the given language
   * @param subject The RDF.Term to find the rdfs:label for
   * @param store A N3 quad store
   * @param language A language tag
   * @returns An RDF.Literal or undefined if not found
   */
  public getLabel(subject: RDF.Term, language?: string): RDF.Literal | undefined {
    return this.getLabels(subject).find(x => x.language === (language || ''));
  }

  /**
   * Find all rdfs:comments for a given subject
   * @param subject The RDF.Term to find the rdfs:comments for
   * @param store A N3 quad store
   * @returns An array of RDF.Literals
   */
  public getDefinitions(subject: RDF.Term): RDF.Literal[] {
    return <RDF.Literal[]>this.store.getObjects(subject, ns.rdfs('comment'), null);
  }

  /**
   * Finds the rdfs:comment whose language tag matches the given language
   * @param subject The RDF.Term to find the rdfs:comment for
   * @param store A N3 quad store
   * @param language A language tag
   * @returns An RDF.Literal or undefined if not found
   */
  public getDefinition(subject: RDF.Term, language?: string): RDF.Literal | undefined {
    return this.getDefinitions(subject).find(x => x.language === (language || ''));
  }

  /**
   * Finds the rdfs:range of a given RDF.Term
   * @param subject The RDF.Term to find the range of
   * @param store A N3 quad store
   * @returns An RDF.Term or undefined if not found
   */
  public getRange(subject: RDF.Term): RDF.NamedNode | undefined {
    return <RDF.NamedNode | undefined>this.store.getObjects(subject, ns.rdfs('range'), null).shift();
  }

  /**
   * Finds the rdfs:domain of a given RDF.Term
   * @param subject The RDF.Term to find the domain of
   * @param store A N3 quad store
   * @returns An RDF.Term or undefined if not found
   */
  public getDomain(subject: RDF.Term): RDF.NamedNode | undefined {
    return <RDF.NamedNode | undefined>this.store.getObjects(subject, ns.rdfs('domain'), null).shift();
  }

  /**
   * Finds all the vann:usageNotes of a given RDF.Term
   * @param subject The RDF.Term to find the usage notes for
   * @param store A N3 quad store
   * @returns An array of RDF.Literals
   */
  public getUsageNotes(subject: RDF.Term): RDF.Literal[] {
    return <RDF.Literal[]>this.store.getObjects(subject, ns.vann('usageNote'), null);
  }

  /**
   * Finds the vann:usageNote of which the language tag matches the given language
   * @param subject The RDF.Term to find the usage note for
   * @param store A N3 quad store
   * @param language A language tag
   * @returns An RDF.Literal or undefined if not found
   */
  public getUsageNote(subject: RDF.Term, language?: string): RDF.Literal | undefined {
    return this.getUsageNotes(subject).find(x => x.language === (language || ''));
  }

  /**
   * Finds the example:scope of a given subject
   * @param subject The RDF.Term to find the scope for
   * @returns An RDF.NamedNode or undefined if not found
   */
  public getScope(subject: RDF.Term): RDF.NamedNode | undefined {
    return <RDF.NamedNode | undefined>this.store.getObjects(subject, ns.example('scope'), null).shift();
  }

  /**
   * Finds the shacl:minCardinality for a given subject
   * @param subject The RDF.Term to find the shacl:minCardinaly for
   * @returns An RDF.Literal or undefined if not found
   */
  public getMinCardinality(subject: RDF.Term): RDF.Literal | undefined {
    return <RDF.Literal | undefined>this.store.getObjects(subject, ns.shacl('minCount'), null).shift();
  }

  /**
 * Finds the shacl:maxCardinality for a given subject
 * @param subject The RDF.Term to find the shacl:maxCardinaly for
 * @returns An RDF.Literal or undefined if not found
 */
  public getMaxCardinality(subject: RDF.Term): RDF.Literal | undefined {
    return <RDF.Literal | undefined>this.store.getObjects(subject, ns.shacl('maxCount'), null).shift();
  }

  /**
   * Finds all the rdfs:subClassOf of a given RDF.Term
   * @param subject the RDF.Term to find the parents of
   * @param store A N3 quad store
   * @returns An array of RDF.Terms
   */
  public getParentsOfClass(subject: RDF.Term): RDF.NamedNode[] {
    return <RDF.NamedNode[]>this.store.getObjects(subject, ns.rdfs('subClassOf'), null);
  }

  /**
   * Finds the rdfs:subPropertyOf of a given RDF.Term
   * @param subject The RDF.Term to find the parent of
   * @param store A N3 quad store
   * @returns An RDF.Term or undefined if not found
   */
  public getParentOfProperty(subject: RDF.Term): RDF.NamedNode | undefined {
    return <RDF.NamedNode | undefined>this.store.getObjects(subject, ns.rdfs('subPropertyOf'), null).shift();
  }

  /**
   * Find the subject of the statement that matches the given subject, predicate and object
   * @param statementSubject The subject to match the statement subject
   * @param statementPredicate The predicate to match the statement predicate
   * @param statementObject The object to match the statement object
   * @param store An N3 quad store
   * @returns an RDF.Term or undefined if none found
   */
  public getTargetStatementId(
    statementSubject: RDF.Term,
    statementPredicate: RDF.Term,
    statementObject: RDF.Term,
  ): RDF.Term | undefined {
    const statementIds = this.store.getSubjects(ns.rdf('type'), ns.rdf('Statement'), null);
    const statementSubjectPredicateSubjects = this.store.getSubjects(ns.rdf('subject'), statementSubject, null);
    const statementPredicatePredicateSubjects = this.store.getSubjects(ns.rdf('predicate'), statementPredicate, null);
    const statementObjectPredicateSubjects = this.store.getSubjects(ns.rdf('object'), statementObject, null);

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
   * Finds the assigned URI in rdf:Statements
   * @param subject The statement subject
   * @param predicate The statement predicate
   * @param object The statement object for which the assigned URI must be found
   * @param store A N3 quad store
   * @returns An RDF.Term or undefined if not found
   */
  public getAssignedUriViaStatements(
    subject: RDF.Term,
    predicate: RDF.Term,
    object: RDF.Term,
  ): RDF.NamedNode | undefined {
    const statementId = this.getTargetStatementId(subject, predicate, object);

    if (!statementId) {
      return undefined;
    }

    return this.getAssignedUri(statementId);
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
  public getLabelViaStatements(
    subject: RDF.Term,
    predicate: RDF.Term,
    object: RDF.Term,
    language: string,
  ): RDF.Literal | undefined {
    const statementId = this.getTargetStatementId(subject, predicate, object);

    if (!statementId) {
      return undefined;
    }

    const label = this.getLabel(statementId, language);
    return label || this.getLabel(statementId);
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
  public getDefinitionViaStatements(
    subject: RDF.Term,
    predicate: RDF.Term,
    object: RDF.Term,
    language: string,
  ): RDF.Literal | undefined {
    const statementId = this.getTargetStatementId(subject, predicate, object);

    if (!statementId) {
      return undefined;
    }

    const definition = this.getDefinition(statementId, language);
    return definition || this.getDefinition(statementId);
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
  public getUsageNoteViaStatements(
    subject: RDF.Term,
    predicate: RDF.Term,
    object: RDF.Term,
    language: string,
  ): RDF.Literal | undefined {
    const statementId = this.getTargetStatementId(subject, predicate, object);

    if (!statementId) {
      return undefined;
    }

    const usageNote = this.getUsageNote(statementId, language);
    return usageNote || this.getUsageNote(statementId);
  }
}
