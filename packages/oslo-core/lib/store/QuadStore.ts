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
      rdfParser
        .parse(textStream, { path: file })
        .on('data', (quad: RDF.Quad) => this.store.addQuad(quad))
        .on('error', (error: unknown) => reject(error))
        .on('end', () => resolve());
    });
  }

  public findQuads(
    subject: RDF.Term | null,
    predicate: RDF.Term | null,
    object: RDF.Term | null,
    graph: RDF.Term | null = null,
  ): RDF.Quad[] {
    return this.store.getQuads(subject, predicate, object, graph);
  }

  public findQuad(
    subject: RDF.Term | null,
    predicate: RDF.Term | null,
    object: RDF.Term | null,
    graph: RDF.Term | null = null,
  ): RDF.Quad | undefined {
    return this.findQuads(subject, predicate, object, graph).shift();
  }

  public findSubjects(
    predicate: RDF.Term,
    object: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.Term[] {
    return <RDF.Term[]>this.store.getSubjects(predicate, object, graph);
  }

  public findSubject(
    predicate: RDF.Term,
    object: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.Term | undefined {
    return this.findSubjects(predicate, object, graph).shift();
  }

  public findObjects(
    subject: RDF.Term,
    predicate: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.Term[] {
    return <RDF.Term[]>this.store.getObjects(subject, predicate, graph);
  }

  public findObject(
    subject: RDF.Term,
    predicate: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.Term | undefined {
    return this.findObjects(subject, predicate, graph).shift();
  }

  /**
   * Finds the subject where predicate is 'rdf:type' and object 'oslo:Package'
   * @returns a RDF.NamedNode or undefined
   */
  public getPackageId(): RDF.NamedNode | undefined {
    return <RDF.NamedNode | undefined>(
      this.store.getSubjects(ns.rdf('type'), ns.oslo('Package'), null).shift()
    );
  }

  /**
   * Finds all subjects where predicate is 'rdf:type' and object 'owl:Class'
   * @returns an array of RDF.NamedNodes
   */
  public getClassIds(graph: RDF.Term | null = null): RDF.NamedNode[] {
    return <RDF.NamedNode[]>(
      this.store.getSubjects(ns.rdf('type'), ns.owl('Class'), graph)
    );
  }

  /**
   * Finds all subjects where predicate is 'rdf:type' and object 'owl:DatatypeProperty'
   * @returns an array of RDF.NamedNodes
   */
  public getDatatypePropertyIds(
    graph: RDF.Term | null = null,
  ): RDF.NamedNode[] {
    return <RDF.NamedNode[]>(
      this.store.getSubjects(ns.rdf('type'), ns.owl('DatatypeProperty'), graph)
    );
  }

  /**
   * Finds all subjects where predicate is 'rdf:type' and object 'owl:ObjectProperty'
   * @returns an array of RDF.NamedNodes
   */
  public getObjectPropertyIds(graph: RDF.Term | null = null): RDF.NamedNode[] {
    return <RDF.NamedNode[]>(
      this.store.getSubjects(ns.rdf('type'), ns.owl('ObjectProperty'), graph)
    );
  }

  /**
   * For a given subject, the quad store is queried to find the assigned URI
   * @param subject The subject for which the assigned URI is to be retrieved
   * @param store The quad store
   * @returns An RDF.NamedNode or undefined if not found
   */
  public getAssignedUri(
    subject: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.NamedNode | undefined {
    return <RDF.NamedNode | undefined>(
      this.store.getObjects(subject, ns.oslo('assignedURI'), graph).shift()
    );
  }

  /**
   * Find all quads with a label predicate (vocLabel, apLabel and diagramLabel) for a given subject
   * @param subject The RDF.Term to find the labels for
   * @param store A N3 quad store
   * @returns An array of RDF.Quads
   */
  public getLabels(
    subject: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.Quad[] {
    const vocLabel = this.store.getQuads(
      subject,
      ns.oslo('vocLabel'),
      null,
      graph,
    );
    const apLabel = this.store.getQuads(
      subject,
      ns.oslo('apLabel'),
      null,
      graph,
    );
    const diagramLabel = this.store.getQuads(
      subject,
      ns.oslo('diagramLabel'),
      null,
      graph,
    );
    return <RDF.Quad[]>vocLabel.concat(apLabel).concat(diagramLabel);
  }

  /**
   * Finds the rdfs:label whose language tag matches the given language
   * @param subject The RDF.Term to find the rdfs:label for
   * @param store A N3 quad store
   * @param language A language tag
   * @returns An RDF.Literal or undefined if not found
   */
  public getLabel(
    subject: RDF.Term,
    language?: string,
    graph: RDF.Term | null = null,
  ): RDF.Quad | undefined {
    return this.getLabels(subject, graph).find(
      x => (<RDF.Literal>x.object).language === (language || ''),
    );
  }

  /**
   * Find all rdfs:comments for a given subject
   * @param subject The RDF.Term to find the rdfs:comments for
   * @param store A N3 quad store
   * @returns An array of RDF.Literals
   */
  public getDefinitions(
    subject: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.Quad[] {
    const vocDefinitions = this.store.getQuads(
      subject,
      ns.oslo('vocDefinition'),
      null,
      graph
    );

    const apDefinitions = this.store.getQuads(
      subject,
      ns.oslo('apDefinition'),
      null,
      graph
    );
    return <RDF.Quad[]>(
      vocDefinitions.concat(apDefinitions)
    );
  }

  /**
   * Finds the rdfs:comment whose language tag matches the given language
   * @param subject The RDF.Term to find the rdfs:comment for
   * @param store A N3 quad store
   * @param language A language tag
   * @returns An RDF.Literal or undefined if not found
   */
  public getDefinition(
    subject: RDF.Term,
    language?: string,
    graph: RDF.Term | null = null,
  ): RDF.Quad | undefined {
    return this.getDefinitions(subject, graph).find(
      x => (<RDF.Literal>x.object).language === (language || ''),
    );
  }

  /**
   * Finds the rdfs:range of a given RDF.Term
   * @param subject The RDF.Term to find the range of
   * @param store A N3 quad store
   * @returns An RDF.Term or undefined if not found
   */
  public getRange(
    subject: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.NamedNode | undefined {
    return <RDF.NamedNode | undefined>(
      this.store.getObjects(subject, ns.rdfs('range'), graph).shift()
    );
  }

  /**
   * Finds the rdfs:domain of a given RDF.Term
   * @param subject The RDF.Term to find the domain of
   * @param store A N3 quad store
   * @returns An RDF.Term or undefined if not found
   */
  public getDomain(
    subject: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.NamedNode | undefined {
    return <RDF.NamedNode | undefined>(
      this.store.getObjects(subject, ns.rdfs('domain'), graph).shift()
    );
  }

  /**
   * Finds all the vann:usageNotes of a given RDF.Term
   * @param subject The RDF.Term to find the usage notes for
   * @param store A N3 quad store
   * @returns An array of RDF.Literals
   */
  public getUsageNotes(
    subject: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.Quad[] {
    const vocUsageNotes = this.store.getQuads(
      subject,
      ns.oslo('vocUsageNote'),
      null,
      graph
    );

    const apUsageNotes = this.store.getQuads(
      subject,
      ns.oslo('apUsageNote'),
      null,
      graph
    );
    return <RDF.Quad[]>vocUsageNotes.concat(apUsageNotes);
  }

  /**
   * Finds the vann:usageNote of which the language tag matches the given language
   * @param subject The RDF.Term to find the usage note for
   * @param store A N3 quad store
   * @param language A language tag
   * @returns An RDF.Literal or undefined if not found
   */
  public getUsageNote(
    subject: RDF.Term,
    language?: string,
    graph: RDF.Term | null = null,
  ): RDF.Quad | undefined {
    return this.getUsageNotes(subject, graph).find(
      x => (<RDF.Literal>x.object).language === (language || ''),
    );
  }

  /**
   * Finds the example:scope of a given subject
   * @param subject The RDF.Term to find the scope for
   * @returns An RDF.NamedNode or undefined if not found
   */
  public getScope(
    subject: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.NamedNode | undefined {
    return <RDF.NamedNode | undefined>(
      this.store.getObjects(subject, ns.oslo('scope'), graph).shift()
    );
  }

  /**
   * Finds the shacl:minCardinality for a given subject
   * @param subject The RDF.Term to find the shacl:minCardinaly for
   * @returns An RDF.Literal or undefined if not found
   */
  public getMinCardinality(
    subject: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.Literal | undefined {
    return <RDF.Literal | undefined>(
      this.store.getObjects(subject, ns.shacl('minCount'), graph).shift()
    );
  }

  /**
   * Finds the shacl:maxCardinality for a given subject
   * @param subject The RDF.Term to find the shacl:maxCardinaly for
   * @returns An RDF.Literal or undefined if not found
   */
  public getMaxCardinality(
    subject: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.Literal | undefined {
    return <RDF.Literal | undefined>(
      this.store.getObjects(subject, ns.shacl('maxCount'), graph).shift()
    );
  }

  /**
   * Finds all the rdfs:subClassOf of a given RDF.Term
   * @param subject the RDF.Term to find the parents of
   * @param store A N3 quad store
   * @returns An array of RDF.Terms
   */
  public getParentsOfClass(
    subject: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.NamedNode[] {
    return <RDF.NamedNode[]>(
      this.store.getObjects(subject, ns.rdfs('subClassOf'), graph)
    );
  }

  /**
   * Finds the rdfs:subPropertyOf of a given RDF.Term
   * @param subject The RDF.Term to find the parent of
   * @param store A N3 quad store
   * @returns An RDF.Term or undefined if not found
   */
  public getParentOfProperty(
    subject: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.NamedNode | undefined {
    return <RDF.NamedNode | undefined>(
      this.store.getObjects(subject, ns.rdfs('subPropertyOf'), graph).shift()
    );
  }

  public getCodelist(
    subject: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.NamedNode | undefined {
    return <RDF.NamedNode | undefined>(
      this.store.getObjects(subject, ns.oslo('codelist'), graph).shift()
    );
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
    const statementIds = this.store.getSubjects(
      ns.rdf('type'),
      ns.rdf('Statement'),
      null,
    );
    const statementSubjectPredicateSubjects = this.store.getSubjects(
      ns.rdf('subject'),
      statementSubject,
      null,
    );
    const statementPredicatePredicateSubjects = this.store.getSubjects(
      ns.rdf('predicate'),
      statementPredicate,
      null,
    );
    const statementObjectPredicateSubjects = this.store.getSubjects(
      ns.rdf('object'),
      statementObject,
      null,
    );

    const targetIds = statementIds
      .filter(x =>
        statementSubjectPredicateSubjects.some(y => y.value === x.value))
      .filter(x =>
        statementPredicatePredicateSubjects.some(y => y.value === x.value))
      .filter(x =>
        statementObjectPredicateSubjects.some(y => y.value === x.value));

    if (targetIds.length > 1) {
      throw new Error(
        `Found multiple statements with subject "${statementSubject.value}", predicate "${statementPredicate.value}" and object "${statementObject.value}".`,
      );
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
  ): RDF.Quad | undefined {
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
  ): RDF.Quad | undefined {
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
  ): RDF.Quad | undefined {
    const statementId = this.getTargetStatementId(subject, predicate, object);

    if (!statementId) {
      return undefined;
    }

    const usageNote = this.getUsageNote(statementId, language);
    return usageNote || this.getUsageNote(statementId);
  }
}
