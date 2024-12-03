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
    const buffer: Buffer = await fetchFileOrUrl(file);
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
   * Finds all subjects where predicate is 'rdf:type' and object 'rdfs:Datatype'
   * @returns an array of RDF.NamedNodes
   */
  public getDatatypes(graph: RDF.Term | null = null): RDF.NamedNode[] {
    return <RDF.NamedNode[]>(
      this.store.getSubjects(ns.rdf('type'), ns.rdfs('Datatype'), graph)
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
    const vocLabel: RDF.Quad[] = this.store.getQuads(
      subject,
      ns.oslo('vocLabel'),
      null,
      graph,
    );
    const apLabel: RDF.Quad[] = this.store.getQuads(
      subject,
      ns.oslo('apLabel'),
      null,
      graph,
    );
    const diagramLabel: RDF.Quad[] = this.store.getQuads(
      subject,
      ns.oslo('diagramLabel'),
      null,
      graph,
    );
    return vocLabel.concat(apLabel).concat(diagramLabel);
  }

  /**
   * Finds the oslo:vocLabel whose language tag matches the given language
   * @param subject The RDF.Term to find the oslo:vocLabel for
   * @param store A N3 quad store
   * @param language A language tag
   * @returns An RDF.Literal or undefined if not found
   */
  public getVocLabel(
    subject: RDF.Term,
    language?: string,
    graph: RDF.Term | null = null,
  ): RDF.Literal | undefined {
    return <RDF.Literal>(
      this.getLabels(subject, graph).find(
        (x: RDF.Quad) =>
          x.predicate.equals(ns.oslo('vocLabel')) &&
          (<RDF.Literal>x.object).language === (language || ''),
      )?.object
    );
  }

  /**
   * Finds the oslo:apLabel whose language tag matches the given language
   * @param subject The RDF.Term to find the oslo:apLabel for
   * @param store A N3 quad store
   * @param language A language tag
   * @returns An RDF.Literal or undefined if not found
   */
  public getApLabel(
    subject: RDF.Term,
    language?: string,
    graph: RDF.Term | null = null,
  ): RDF.Literal | undefined {
    return <RDF.Literal>(
      this.getLabels(subject, graph).find(
        (x: RDF.Quad) =>
          x.predicate.equals(ns.oslo('apLabel')) &&
          (<RDF.Literal>x.object).language === (language || ''),
      )?.object
    );
  }

  /**
   * Finds the oslo:diagramLabel for a given subject
   * @param subject The RDF.Term to find the oslo:diagramLabel for
   * @param store A N3 quad store
   * @param language A language tag
   * @returns An RDF.Literal or undefined if not found
   */
  public getDiagramLabel(
    subject: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.Literal | undefined {
    return <RDF.Literal>(
      this.getLabels(subject, graph).find((x: RDF.Quad) =>
        x.predicate.equals(ns.oslo('diagramLabel')),
      )?.object
    );
  }

  /**
   * Find all definitions for a given subject
   * @param subject The RDF.Term to find the definitions for
   * @param store A N3 quad store
   * @returns An array of RDF.Literals
   */
  public getDefinitions(
    subject: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.Quad[] {
    const vocDefinitions: RDF.Quad[] = this.store.getQuads(
      subject,
      ns.oslo('vocDefinition'),
      null,
      graph,
    );

    const apDefinitions: RDF.Quad[] = this.store.getQuads(
      subject,
      ns.oslo('apDefinition'),
      null,
      graph,
    );
    return vocDefinitions.concat(apDefinitions);
  }

  /**
   * Finds the oslo:vocDefinition whose language tag matches the given language
   * @param subject The RDF.Term to find the oslo:vocDefinition for
   * @param store A N3 quad store
   * @param language A language tag
   * @returns An RDF.Literal or undefined if not found
   */
  public getVocDefinition(
    subject: RDF.Term,
    language?: string,
    graph: RDF.Term | null = null,
  ): RDF.Literal | undefined {
    return <RDF.Literal>(
      this.getDefinitions(subject, graph).find(
        (x: RDF.Quad) =>
          x.predicate.equals(ns.oslo('vocDefinition')) &&
          (<RDF.Literal>x.object).language === (language || ''),
      )?.object
    );
  }

  /**
   * Finds the oslo:apDefinition whose language tag matches the given language
   * @param subject The RDF.Term to find the oslo:apDefinition for
   * @param store A N3 quad store
   * @param language A language tag
   * @returns An RDF.Literal or undefined if not found
   */
  public getApDefinition(
    subject: RDF.Term,
    language?: string,
    graph: RDF.Term | null = null,
  ): RDF.Literal | undefined {
    return <RDF.Literal>(
      this.getDefinitions(subject, graph).find(
        (x: RDF.Quad) =>
          x.predicate.equals(ns.oslo('apDefinition')) &&
          (<RDF.Literal>x.object).language === (language || ''),
      )?.object
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
   * Finds all the usageNotes (voc and ap) of a given RDF.Term
   * @param subject The RDF.Term to find the usage notes for
   * @param store A N3 quad store
   * @returns An array of RDF.Literals
   */
  public getUsageNotes(
    subject: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.Quad[] {
    const vocUsageNotes: RDF.Quad[] = this.store.getQuads(
      subject,
      ns.oslo('vocUsageNote'),
      null,
      graph,
    );

    const apUsageNotes: RDF.Quad[] = this.store.getQuads(
      subject,
      ns.oslo('apUsageNote'),
      null,
      graph,
    );
    return vocUsageNotes.concat(apUsageNotes);
  }

  /**
   * Finds the oslo:vocUsageNote of which the language tag matches the given language
   * @param subject The RDF.Term to find the vocabulary usage note for
   * @param store A N3 quad store
   * @param language A language tag
   * @returns An RDF.Literal or undefined if not found
   */
  public getVocUsageNote(
    subject: RDF.Term,
    language?: string,
    graph: RDF.Term | null = null,
  ): RDF.Literal | undefined {
    return <RDF.Literal>(
      this.getUsageNotes(subject, graph).find(
        (x: RDF.Quad) =>
          x.predicate.equals(ns.oslo('vocUsageNote')) &&
          (<RDF.Literal>x.object).language === (language || ''),
      )?.object
    );
  }

  /**
   * Finds the oslo:apUsageNote of which the language tag matches the given language
   * @param subject The RDF.Term to find the application profile usage note for
   * @param store A N3 quad store
   * @param language A language tag
   * @returns An RDF.Literal or undefined if not found
   */
  public getApUsageNote(
    subject: RDF.Term,
    language?: string,
    graph: RDF.Term | null = null,
  ): RDF.Literal | undefined {
    return <RDF.Literal>(
      this.getUsageNotes(subject, graph).find(
        (x: RDF.Quad) =>
          x.predicate.equals(ns.oslo('apUsageNote')) &&
          (<RDF.Literal>x.object).language === (language || ''),
      )?.object
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
   * Finds the status of a given RDF.Term
   * @param subject The RDF.Term to find the status of
   * @param store A N3 quad store
   * @returns An RDF.Term or undefined if not found
   */
  public getStatus(
    subject: RDF.Term,
    graph: RDF.Term | null = null,
  ): RDF.NamedNode | undefined {
    return <RDF.NamedNode | undefined>(
      this.store.getObjects(subject, ns.adms('status'), graph).shift()
    );
  }

  /**
   * Finds all the other tags. 
   * This could be any tag that is not a label, definition, usage note, scope, minCardinality, maxCardinality, parent, range, domain, status or codelist
   * @param subject The RDF.Term to find the other tags for
   * @param store A N3 quad store
   * @returns An array of RDF.Literals
   */
  public getOtherTags(
    subject: RDF.Term,
    graph: RDF.NamedNode | null = null,
  ): RDF.Quad[] {
    const any: RDF.Quad[] = this.store.getQuads(
      subject,
      ns.oslo('any'),
      null,
      graph,
    );

    return any;
  }
}
