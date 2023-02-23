/**
 * @group unit
 */
import fs from 'fs';
import fsp from 'fs/promises';
import type * as RDF from '@rdfjs/types';
import * as N3 from 'n3';
import * as __ from 'node-fetch';
import { DataFactory } from 'rdf-data-factory';
import rdfParser from 'rdf-parse';
import streamifyString from 'streamify-string';
import * as _ from '../lib/utils/fetchFileOrUrl';
import {
  createN3Store,
  getAssignedUri,
  getAssignedUriViaStatements,
  getDefinition,
  getDefinitions,
  getDefinitionViaStatements,
  getDomain,
  getLabel,
  getLabels,
  getLabelViaStatements,
  getParentOfProperty,
  getParentsOfClass,
  getRange,
  getTargetStatementId,
  getUsageNote,
  getUsageNotes,
  getUsageNoteViaStatements,
} from '../lib/utils/N3StoreFunctions';
import { uniqueId } from '../lib/utils/uniqueId';
import {
  singleStatement,
  multipleStatements,
  dataWithAssignedUri,
  dataWithLabels,
  dataWithDefinitions,
  dataWithClassParents,
  dataWithPropertyParent,
  dataWithRange,
  dataWithDomain,
  dataWithUsageNotes,
  dataWithDefinitionInStatementsWithoutLanguageTag,
  dataWitUsageNoteInStatementsWithoutLanguageTag,
} from './data/mockData';

describe('Util functions', () => {
  let store: N3.Store;
  const df: DataFactory = new DataFactory();

  function parseJsonld(data: any): Promise<RDF.Quad[]> {
    const textStream = streamifyString(JSON.stringify(data));

    return new Promise<RDF.Quad[]>((resolve, reject) => {
      const quads: RDF.Quad[] = [];
      rdfParser.parse(textStream, { contentType: 'application/ld+json' })
        .on('data', (quad: RDF.Quad) => quads.push(quad))
        .on('error', (error: unknown) => reject(error))
        .on('end', () => resolve(quads));
    });
  }

  beforeEach(() => {
    store = new N3.Store();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch a URL and return a Buffer', async () => {
    jest.spyOn(__, 'default').mockImplementation(() => Promise.resolve(new __.Response('')));
    expect(await _.fetchFileOrUrl('http://example.org')).toBeInstanceOf(Buffer);
    expect(await _.fetchFileOrUrl('https://example.org')).toBeInstanceOf(Buffer);
  });

  it('should fetch a local file and return a Buffer', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs.Stats.prototype, 'isFile').mockImplementation(() => true);
    jest.spyOn(fsp, 'stat').mockReturnValue(Promise.resolve(new fs.Stats()));
    jest.spyOn(fsp, 'readFile').mockReturnValue(Promise.resolve(Buffer.from('')));

    expect(await _.fetchFileOrUrl('file://example.ttl')).toBeInstanceOf(Buffer);
    expect(await _.fetchFileOrUrl('C:\\user\\docs\\file.ttl')).toBeInstanceOf(Buffer);
  });

  it('should throw an error when a local file does not exist', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    await expect(async () => await _.fetchFileOrUrl('file://example.ttl')).rejects.toThrowError();
    await expect(async () => await _.fetchFileOrUrl('C:\\user\\docs\\file.ttl')).rejects.toThrowError();

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fsp, 'stat').mockReturnValue(Promise.resolve(new fs.Stats()));
    jest.spyOn(fs.Stats.prototype, 'isFile').mockImplementation(() => false);

    await expect(async () => await _.fetchFileOrUrl('file://example.ttl')).rejects.toThrowError();
    await expect(async () => await _.fetchFileOrUrl('C:\\user\\docs\\file.ttl')).rejects.toThrowError();
  });

  it('should generate a unique id', async () => {
    const guid = 'test-guid';
    const label = 'test-label';
    const id = 1;

    expect(uniqueId(guid, label, id)).toEqual(uniqueId(guid, label, id));
    expect(uniqueId(guid, label, id)).not.toEqual(uniqueId(guid, label, 2));
  });

  it('should create a N3 quad store', async () => {
    jest.spyOn(_, 'fetchFileOrUrl').mockImplementation(() => Promise.resolve(Buffer.from(
      `<http://example.org/id/1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http//example.org/Test> .`,
    )));

    expect(await createN3Store('http://example.org/testFile.ttl')).toBeInstanceOf(N3.Store);
  });

  it('should throw an error when parsing the file to RDF goes wrong', async () => {
    // Data snippet misses "." at the end to be valid turtle and parser should fail
    jest.spyOn(_, 'fetchFileOrUrl').mockImplementation(() => Promise.resolve(Buffer.from(
      `<http://example.org/id/1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http//example.org/Test>`,
    )));

    await expect(async () => await createN3Store('http://example.org/testFile.ttl')).rejects.toThrowError();
  });

  it('should return the id of the target statement', async () => {
    store.addQuads(await parseJsonld(singleStatement));

    const targetStatement = getTargetStatementId(
      df.namedNode('http://example.org/id/class/1'),
      df.namedNode('http://example.org/examplePredicate'),
      df.namedNode('http://example.org/id/class/2'),
      store,
    );

    const undefinedTargetStatement = getTargetStatementId(
      df.namedNode('http://example.org/id/class/2'),
      df.namedNode('http://example.org/examplePredicate'),
      df.namedNode('http://example.org/id/class/3'),
      store,
    );

    expect(targetStatement?.value).toBe('http://example.org/id/statement/1');
    expect(undefinedTargetStatement).toBe(undefined);
  });

  it('should throw an error when multiple ids are returned for the target statement', async () => {
    store.addQuads(await parseJsonld(multipleStatements));

    expect(() => getTargetStatementId(
      df.namedNode('http://example.org/id/class/1'),
      df.namedNode('http://example.org/examplePredicate'),
      df.namedNode('http://example.org/id/class/2'),
      store,
    )).toThrowError();
  });

  it('should return the assigned URI of a given RDF.Term', async () => {
    store.addQuads(await parseJsonld(dataWithAssignedUri));

    const assignedUri = getAssignedUri(df.namedNode('http://example.org/id/class/1'), store);
    const undefinedAssignedUri = getAssignedUri(df.namedNode('http://example.org/id/class/2'), store);

    expect(assignedUri?.value).toBe('http://example.org/1');
    expect(undefinedAssignedUri).toBe(undefined);
  });

  it('should return the assigned URI of a given triple by searching the rdf:Statements', async () => {
    store.addQuads(await parseJsonld(singleStatement));

    const assignedUri = getAssignedUriViaStatements(
      df.namedNode('http://example.org/id/class/1'),
      df.namedNode('http://example.org/examplePredicate'),
      df.namedNode('http://example.org/id/class/2'),
      store,
    );

    const undefinedAssignedUri = getAssignedUriViaStatements(
      df.namedNode('http://example.org/id/class/2'),
      df.namedNode('http://example.org/examplePredicate'),
      df.namedNode('http://example.org/id/class/3'),
      store,
    );

    expect(assignedUri?.value).toBe('http://example.org/1');
    expect(undefinedAssignedUri).toBe(undefined);
  });

  it('should return all rdfs:labels for a given RDF.Term', async () => {
    store.addQuads(await parseJsonld(dataWithLabels));

    const labels = getLabels(
      df.namedNode('http://example.org/id/class/1'),
      store,
    );

    expect(labels.length).toBe(2);
  });

  it('should return the rdfs:label that has a language tag that matches the configured language', async () => {
    store.addQuads(await parseJsonld(dataWithLabels));

    const label = getLabel(
      df.namedNode('http://example.org/id/class/1'),
      store,
      'nl',
    );

    const undefinedLabel = getLabel(
      df.namedNode('http://example.org/id/class/1'),
      store,
      'es',
    );

    expect(label?.value).toBe('TestLabel');
    expect(undefinedLabel).toBe(undefined);
  });

  it('should return the rdfs:label for a given triple by searching in the rdfs:Statements', async () => {
    store.addQuads(await parseJsonld(singleStatement));

    const label = getLabelViaStatements(
      df.namedNode('http://example.org/id/class/1'),
      df.namedNode('http://example.org/examplePredicate'),
      df.namedNode('http://example.org/id/class/2'),
      store,
      'nl',
    );

    const undefinedLabel = getLabelViaStatements(
      df.namedNode('http://example.org/id/class/2'),
      df.namedNode('http://example.org/examplePredicate'),
      df.namedNode('http://example.org/id/class/3'),
      store,
      'nl',
    );

    expect(label?.value).toBe('TestLabel');
    expect(undefinedLabel).toBe(undefined);
  });

  it('should return all rdfs:comments for a given RDF.Term', async () => {
    store.addQuads(await parseJsonld(dataWithDefinitions));

    const definitions = getDefinitions(
      df.namedNode('http://example.org/id/class/1'),
      store,
    );

    expect(definitions.length).toBe(2);
  });

  it('should return the rdfs:comment that has a language tag that matches the configured language', async () => {
    store.addQuads(await parseJsonld(dataWithDefinitions));

    const definition = getDefinition(
      df.namedNode('http://example.org/id/class/1'),
      store,
      'en',
    );

    const undefinedDefinition = getDefinition(
      df.namedNode('http://example.org/id/class/2'),
      store,
      'en',
    );

    expect(definition?.value).toBe('Another comment');
    expect(undefinedDefinition).toBe(undefined);
  });

  it('should return the rdfs:comment for a given triple by searching in the rdfs:Statements', async () => {
    store.addQuads(await parseJsonld(singleStatement));

    const definition = getDefinitionViaStatements(
      df.namedNode('http://example.org/id/class/1'),
      df.namedNode('http://example.org/examplePredicate'),
      df.namedNode('http://example.org/id/class/2'),
      store,
      'en',
    );

    const undefinedDefinition = getDefinitionViaStatements(
      df.namedNode('http://example.org/id/class/2'),
      df.namedNode('http://example.org/examplePredicate'),
      df.namedNode('http://example.org/id/class/3'),
      store,
      'en',
    );

    expect(definition?.value).toBe('A comment');
    expect(undefinedDefinition).toBe(undefined);
  });

  // eslint-disable-next-line max-len
  it('should try to find an rdfs:comment without language tag if no rdfs:comment with matching language tag is present in the rdf:Statements', async () => {
    store.addQuads(await parseJsonld(dataWithDefinitionInStatementsWithoutLanguageTag));

    const definition = getDefinitionViaStatements(
      df.namedNode('http://example.org/id/class/1'),
      df.namedNode('http://example.org/examplePredicate'),
      df.namedNode('http://example.org/id/class/2'),
      store,
      'en',
    );

    expect(definition?.value).toBe('A comment');
    expect(definition?.language).toBe('');
  });

  it('should return all parents of a given class', async () => {
    store.addQuads(await parseJsonld(dataWithClassParents));
    const parents = getParentsOfClass(
      df.namedNode('http://example.org/id/class/1'),
      store,
    );

    expect(parents)
      .toEqual(expect.arrayContaining(
        [
          expect.objectContaining(df.namedNode('http://example.org/id/class/2')),
          expect.objectContaining(df.namedNode('http://example.org/id/class/3')),
        ],
      ));
  });

  it('should return the parent of an attribute', async () => {
    store.addQuads(await parseJsonld(dataWithPropertyParent));

    const parent = getParentOfProperty(
      df.namedNode('http://example.org/id/property/1'),
      store,
    );

    const undefinedParent = getParentOfProperty(
      df.namedNode('http://example.org/id/property/2'),
      store,
    );

    expect(parent?.value).toBe('http://example.org/id/property/2');
    expect(undefinedParent).toBe(undefined);
  });

  it('should return the range of a given RDF.Term', async () => {
    store.addQuads(await parseJsonld(dataWithRange));

    const range = getRange(
      df.namedNode('http://example.org/id/property/1'),
      store,
    );

    const undefinedRange = getRange(
      df.namedNode('http://example.org/id/property/2'),
      store,
    );

    expect(range?.value).toBe('http://example.org/id/property/2');
    expect(undefinedRange).toBe(undefined);
  });

  it('should return the domain of a given RDF.Term', async () => {
    store.addQuads(await parseJsonld(dataWithDomain));

    const domain = getDomain(
      df.namedNode('http://example.org/id/property/1'),
      store,
    );

    const undefinedDomain = getRange(
      df.namedNode('http://example.org/id/property/2'),
      store,
    );

    expect(domain?.value).toBe('http://example.org/id/class/1');
    expect(undefinedDomain).toBe(undefined);
  });

  it('should return all vann:usageNotes for a given RDF.Term', async () => {
    store.addQuads(await parseJsonld(dataWithUsageNotes));

    const usageNotes = getUsageNotes(
      df.namedNode('http://example.org/id/class/1'),
      store,
    );

    expect(usageNotes.length).toBe(2);
  });

  it('should return the vann:usageNote that has a language tag that matches the configured language', async () => {
    store.addQuads(await parseJsonld(dataWithUsageNotes));

    const usageNote = getUsageNote(
      df.namedNode('http://example.org/id/class/1'),
      store,
      'en',
    );

    const undefinedUsageNote = getUsageNote(
      df.namedNode('http://example.org/id/class/2'),
      store,
      'en',
    );

    expect(usageNote?.value).toBe('Another usage note');
    expect(undefinedUsageNote).toBe(undefined);
  });

  it('should return the van:usageNote for a given triple by searching in the rdfs:Statements', async () => {
    store.addQuads(await parseJsonld(singleStatement));

    const usageNote = getUsageNoteViaStatements(
      df.namedNode('http://example.org/id/class/1'),
      df.namedNode('http://example.org/examplePredicate'),
      df.namedNode('http://example.org/id/class/2'),
      store,
      'en',
    );

    const undefinedUsageNote = getUsageNoteViaStatements(
      df.namedNode('http://example.org/id/class/2'),
      df.namedNode('http://example.org/examplePredicate'),
      df.namedNode('http://example.org/id/class/3'),
      store,
      'en',
    );

    expect(usageNote?.value).toBe('A usage note');
    expect(undefinedUsageNote).toBe(undefined);
  });

  // eslint-disable-next-line max-len
  it('should try to find an vann:usageNote without language tag if no vann:usageNote with matching language tag is present in the rdf:Statements', async () => {
    store.addQuads(await parseJsonld(dataWitUsageNoteInStatementsWithoutLanguageTag));

    const usageNote = getUsageNoteViaStatements(
      df.namedNode('http://example.org/id/class/1'),
      df.namedNode('http://example.org/examplePredicate'),
      df.namedNode('http://example.org/id/class/2'),
      store,
      'en',
    );

    expect(usageNote?.value).toBe('A usage note');
    expect(usageNote?.language).toBe('');
  });
});
