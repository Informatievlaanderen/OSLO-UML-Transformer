/**
 * @group unit
 */

import 'reflect-metadata';
import { OutputFormat } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import rdfParser from 'rdf-parse';
import streamifyString from 'streamify-string';

import { QuadStore } from '../lib/store/QuadStore';
import * as _ from '../lib/utils/fetchFileOrUrl';
import { ns } from '../lib/utils/namespaces';
import {
  dataWithAssignedUri,
  dataWithLabels,
  dataWithDefinitions,
  dataWithClassParents,
  dataWithPropertyParent,
  dataWithRange,
  dataWithDomain,
  dataWithUsageNotes,
  dataWithCodelist,
} from './data/mockData';

jest.mock('@oslo-flanders/core', () => {
  return {
    ...jest.requireActual('@oslo-flanders/core'),
    createN3Store: jest.fn(),
  };
});

function parseJsonld(data: any): Promise<RDF.Quad[]> {
  const textStream = streamifyString(JSON.stringify(data));

  return new Promise<RDF.Quad[]>((resolve, reject) => {
    const quads: RDF.Quad[] = [];
    rdfParser
      .parse(textStream, { contentType: OutputFormat.JsonLd })
      .on('data', (quad: RDF.Quad) => quads.push(quad))
      .on('error', (error: unknown) => reject(error))
      .on('end', () => resolve(quads));
  });
}

describe('QuadStore functions', () => {
  let store: QuadStore;
  let quads: RDF.Quad[];
  const df = new DataFactory();

  beforeAll(() => {
    quads = [
      df.quad(
        df.namedNode('http://example.org/subject/1'),
        df.namedNode('http://example.org/predicate/1'),
        df.namedNode('http://example.org/object/1'),
      ),
    ];
  });

  beforeEach(() => {
    store = new QuadStore();
  });

  it('should be able to parse valid RDF (or a serialization)', async () => {
    jest
      .spyOn(_, 'fetchFileOrUrl')
      .mockImplementation(() =>
        Promise.resolve(
          Buffer.from(
            `<http://example.org/id/1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http//example.org/Test> .`,
          ),
        ),
      );
    (<any>store).store.addQuad = jest.fn();

    await expect(
      store.addQuadsFromFile('http://example.org/testFile.ttl'),
    ).resolves.not.toThrow();
    expect((<any>store).store.addQuad).toHaveBeenCalled();
  });

  it('should throw an error when parsing the file to RDF goes wrong', async () => {
    // Data snippet misses "." at the end to be valid turtle and parser should fail
    jest
      .spyOn(_, 'fetchFileOrUrl')
      .mockImplementation(() =>
        Promise.resolve(
          Buffer.from(
            `<http://example.org/id/1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http//example.org/Test>`,
          ),
        ),
      );

    await expect(
      async () =>
        await store.addQuadsFromFile('http://example.org/testFile.ttl'),
    ).rejects.toThrowError();
  });

  it('should add an array of quads', async () => {
    (<any>store).store.addQuads = jest.fn();
    store.addQuads(quads);

    expect((<any>store).store.addQuads).toHaveBeenCalled();
  });

  it('should add a quad', async () => {
    (<any>store).store.addQuad = jest.fn();
    store.addQuad(quads[0]);

    expect((<any>store).store.addQuad).toHaveBeenCalled();
  });

  it('should find an array of quads matching a triple pattern', async () => {
    (<any>store).store.getQuads = jest.fn();
    store.findQuads(
      df.namedNode('http://example.org/subject/1'),
      df.namedNode('http://example.org/predicate/1'),
      df.namedNode('http://example.org/object/1'),
    );

    expect((<any>store).store.getQuads).toHaveBeenCalled();
  });

  it('should find a quad matching a triple pattern', async () => {
    (<any>store).findQuads = jest.fn().mockReturnValue([]);
    store.findQuad(
      df.namedNode('http://example.org/subject/1'),
      df.namedNode('http://example.org/predicate/1'),
      df.namedNode('http://example.org/object/1'),
    );

    expect((<any>store).findQuads).toHaveBeenCalled();
  });

  it('should find an array of RDF.Terms matching a predicate and object', async () => {
    (<any>store).store.getSubjects = jest.fn();
    store.findSubjects(
      df.namedNode('http://example.org/predicate/1'),
      df.namedNode('http://example.org/object/1'),
    );

    expect((<any>store).store.getSubjects).toHaveBeenCalled();
  });

  it('should find an RDF.Term matching a predicate and object', async () => {
    (<any>store).findSubjects = jest.fn().mockReturnValue([]);
    store.findSubject(
      df.namedNode('http://example.org/predicate/1'),
      df.namedNode('http://example.org/object/1'),
    );

    expect((<any>store).findSubjects).toHaveBeenCalled();
  });

  it('should find an array of RDF.Terms matching a subject and predicate', async () => {
    (<any>store).store.getObjects = jest.fn();
    store.findObjects(
      df.namedNode('http://example.org/subject/1'),
      df.namedNode('http://example.org/predicate/1'),
    );

    expect((<any>store).store.getObjects).toHaveBeenCalled();
  });

  it('should find a RDF.Term matching a subject and predicate', async () => {
    (<any>store).findObjects = jest.fn().mockReturnValue([]);
    store.findObject(
      df.namedNode('http://example.org/subject/1'),
      df.namedNode('http://example.org/predicate/1'),
    );

    expect((<any>store).findObjects).toHaveBeenCalled();
  });

  it('should return the package id or undefined if not found', async () => {
    expect(store.getPackageId()).toBe(undefined);

    const packageQuad = df.quad(
      df.namedNode('http://example.org/id/package/1'),
      ns.rdf('type'),
      ns.oslo('Package'),
    );

    store.addQuad(packageQuad);
    expect(store.getPackageId()!.value).toBe('http://example.org/id/package/1');
  });

  it('should return all class ids', async () => {
    const classQuad = df.quad(
      df.namedNode('http://example.org/id/class/1'),
      ns.rdf('type'),
      ns.owl('Class'),
    );
    store.addQuad(classQuad);

    expect(store.getClassIds()).toEqual(
      expect.arrayContaining([
        expect.objectContaining(df.namedNode('http://example.org/id/class/1')),
      ]),
    );
  });

  it('should return an array of RDF.NamedNodes that have an rdf:type of owl:DatatypProperty', async () => {
    const datatypePropertyQuad = df.quad(
      df.namedNode('http://example.org/id/property/1'),
      ns.rdf('type'),
      ns.owl('DatatypeProperty'),
    );
    store.addQuad(datatypePropertyQuad);

    expect(store.getDatatypePropertyIds()).toEqual(
      expect.arrayContaining([
        expect.objectContaining(
          df.namedNode('http://example.org/id/property/1'),
        ),
      ]),
    );
  });

  it('should return an array of RDF.NamedNodes that have an rdf:type of owl:ObjectProperty', async () => {
    const objectPropertyQuad = df.quad(
      df.namedNode('http://example.org/id/property/1'),
      ns.rdf('type'),
      ns.owl('ObjectProperty'),
    );
    store.addQuad(objectPropertyQuad);

    expect(store.getObjectPropertyIds()).toEqual(
      expect.arrayContaining([
        expect.objectContaining(
          df.namedNode('http://example.org/id/property/1'),
        ),
      ]),
    );
  });

  it('should return the assigned URI of a given RDF.Term', async () => {
    store.addQuads(await parseJsonld(dataWithAssignedUri));

    const assignedUri = store.getAssignedUri(
      df.namedNode('http://example.org/id/class/1'),
    );
    const undefinedAssignedUri = store.getAssignedUri(
      df.namedNode('http://example.org/id/class/2'),
    );

    expect(assignedUri?.value).toBe('http://example.org/1');
    expect(undefinedAssignedUri).toBe(undefined);
  });

  it('should return all labels for a given RDF.Term', async () => {
    store.addQuads(await parseJsonld(dataWithLabels));

    const labels = store.getLabels(
      df.namedNode('http://example.org/id/class/1'),
    );

    expect(labels.length).toBe(5);
  });

  it('should return the oslo:vocLabel for a given language or undefined if it can not be found', async () => {
    store.addQuads(await parseJsonld(dataWithLabels));
    const vocLabel = store.getVocLabel(
      df.namedNode('http://example.org/id/class/1'),
      'nl',
    );
    const undefinedLabel = store.getVocLabel(
      df.namedNode('http://example.org/id/class/1'),
      'de',
    );

    expect(vocLabel?.value).toBe('TestLabel');
    expect(undefinedLabel).toBe(undefined);
  });

  it('should return the oslo:apLabel for a given language or undefined if it can not be found', async () => {
    store.addQuads(await parseJsonld(dataWithLabels));
    const apLabel = store.getApLabel(
      df.namedNode('http://example.org/id/class/1'),
      'nl',
    );
    const undefinedLabel = store.getApLabel(
      df.namedNode('http://example.org/id/class/1'),
      'de',
    );

    expect(apLabel?.value).toBe('TestLabel');
    expect(undefinedLabel).toBe(undefined);
  });

  it('should return the oslo:diagramLabel for a given language or undefined if it can not be found', async () => {
    store.addQuads(await parseJsonld(dataWithLabels));
    const diagramLabel = store.getDiagramLabel(
      df.namedNode('http://example.org/id/class/1'),
    );
    const undefinedLabel = store.getDiagramLabel(
      df.namedNode('http://example.org/id/class/2'),
    );

    expect(diagramLabel?.value).toBe('TestLabel');
    expect(undefinedLabel).toBe(undefined);
  });

  it('should return all definitions for a given RDF.Term', async () => {
    store.addQuads(await parseJsonld(dataWithDefinitions));

    const definitions = store.getDefinitions(
      df.namedNode('http://example.org/id/class/1'),
    );

    expect(definitions.length).toBe(4);
  });

  it('should return the oslo:vocDefinition for a given language or undefined if it can not be found', async () => {
    store.addQuads(await parseJsonld(dataWithDefinitions));

    const definition = store.getVocDefinition(
      df.namedNode('http://example.org/id/class/1'),
      'en',
    );

    const undefinedDefinition = store.getVocDefinition(
      df.namedNode('http://example.org/id/class/2'),
      'es',
    );

    expect(definition?.value).toBe('Another comment');
    expect(undefinedDefinition).toBe(undefined);
  });

  it('should return the oslo:apDefinition for a given language or undefined if it can not be found', async () => {
    store.addQuads(await parseJsonld(dataWithDefinitions));

    const definition = store.getApDefinition(
      df.namedNode('http://example.org/id/class/1'),
      'en',
    );

    const undefinedDefinition = store.getApDefinition(
      df.namedNode('http://example.org/id/class/2'),
      'es',
    );

    expect(definition?.value).toBe('Another comment');
    expect(undefinedDefinition).toBe(undefined);
  });

  it('should return all parents of a given class', async () => {
    store.addQuads(await parseJsonld(dataWithClassParents));
    const parents = store.getParentsOfClass(
      df.namedNode('http://example.org/id/class/1'),
    );

    expect(parents).toEqual(
      expect.arrayContaining([
        expect.objectContaining(df.namedNode('http://example.org/id/class/2')),
        expect.objectContaining(df.namedNode('http://example.org/id/class/3')),
      ]),
    );
  });

  it('should return the parent of an attribute', async () => {
    store.addQuads(await parseJsonld(dataWithPropertyParent));

    const parent = store.getParentOfProperty(
      df.namedNode('http://example.org/id/property/1'),
    );

    const undefinedParent = store.getParentOfProperty(
      df.namedNode('http://example.org/id/property/2'),
    );

    expect(parent?.value).toBe('http://example.org/id/property/2');
    expect(undefinedParent).toBe(undefined);
  });

  it('should return the range of a given RDF.Term', async () => {
    store.addQuads(await parseJsonld(dataWithRange));

    const range = store.getRange(
      df.namedNode('http://example.org/id/property/1'),
    );

    const undefinedRange = store.getRange(
      df.namedNode('http://example.org/id/property/2'),
    );

    expect(range?.value).toBe('http://example.org/id/property/2');
    expect(undefinedRange).toBe(undefined);
  });

  it('should return the domain of a given RDF.Term', async () => {
    store.addQuads(await parseJsonld(dataWithDomain));

    const domain = store.getDomain(
      df.namedNode('http://example.org/id/property/1'),
    );

    const undefinedDomain = store.getRange(
      df.namedNode('http://example.org/id/property/2'),
    );

    expect(domain?.value).toBe('http://example.org/id/class/1');
    expect(undefinedDomain).toBe(undefined);
  });

  it('should return all usageNotes for a given RDF.Term', async () => {
    store.addQuads(await parseJsonld(dataWithUsageNotes));

    const usageNotes = store.getUsageNotes(
      df.namedNode('http://example.org/id/class/1'),
    );

    expect(usageNotes.length).toBe(4);
  });

  it('should return the oslo:vocUsageNote for a given language or undefined if it can not be found', async () => {
    store.addQuads(await parseJsonld(dataWithUsageNotes));

    const usageNote = store.getVocUsageNote(
      df.namedNode('http://example.org/id/class/1'),
      'en',
    );

    const undefinedUsageNote = store.getVocUsageNote(
      df.namedNode('http://example.org/id/class/1'),
      'de',
    );

    expect(usageNote?.value).toBe('Another usage note');
    expect(undefinedUsageNote).toBe(undefined);
  });

  it('should return the oslo:apUsageNote for a given language or undefined if it can not be found', async () => {
    store.addQuads(await parseJsonld(dataWithUsageNotes));

    const usageNote = store.getApUsageNote(
      df.namedNode('http://example.org/id/class/1'),
      'en',
    );

    const undefinedUsageNote = store.getApUsageNote(
      df.namedNode('http://example.org/id/class/1'),
      'de',
    );

    expect(usageNote?.value).toBe('Another usage note');
    expect(undefinedUsageNote).toBe(undefined);
  });

  it('should return an the scope of an RDF.Term as an RDF.NamedNode or undefined if not found', async () => {
    expect(store.getScope(df.namedNode('http://example.org/subject/1'))).toBe(
      undefined,
    );

    const scopeQuad = df.quad(
      df.namedNode('http://example.org/subject/1'),
      ns.oslo('scope'),
      df.namedNode('http://example.org/inScope'),
    );
    store.addQuad(scopeQuad);

    expect(
      store.getScope(df.namedNode('http://example.org/subject/1'))!.value,
    ).toBe('http://example.org/inScope');
  });

  it('should return an the maxCardinality of an RDF.Term as an RDF.Literal or undefined if not found', async () => {
    expect(
      store.getMaxCardinality(df.namedNode('http://example.org/subject/1')),
    ).toBe(undefined);

    const maxCountQuad = df.quad(
      df.namedNode('http://example.org/subject/1'),
      ns.shacl('maxCount'),
      df.literal('*'),
    );
    store.addQuad(maxCountQuad);

    expect(
      store.getMaxCardinality(df.namedNode('http://example.org/subject/1'))!
        .value,
    ).toBe('*');
  });

  it('should return an the minCardinality of an RDF.Term as an RDF.Literal or undefined if not found', async () => {
    expect(
      store.getMinCardinality(df.namedNode('http://example.org/subject/1')),
    ).toBe(undefined);

    const maxCountQuad = df.quad(
      df.namedNode('http://example.org/subject/1'),
      ns.shacl('minCount'),
      df.literal('1'),
    );
    store.addQuad(maxCountQuad);

    expect(
      store.getMinCardinality(df.namedNode('http://example.org/subject/1'))!
        .value,
    ).toBe('1');
  });

  it('should return a codelist or undefined if it can not be found', async () => {
    store.addQuads(await parseJsonld(dataWithCodelist));
    const codelist = store.getCodelist(
      df.namedNode('http://example.org/id/property/1'),
    );
    const undefinedCodelist = store.getCodelist(
      df.namedNode('http://example.org/id/property/2'),
    );

    expect(codelist?.value).toBe('http://example.org/id/conceptscheme/A');
    expect(undefinedCodelist).toBe(undefined);
  });
});
