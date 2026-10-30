/**
 * @group unit
 */

import 'reflect-metadata';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import type { Logger } from '../lib/logging/Logger';
import { QuadStore } from '../lib/store/QuadStore';
import { ns } from '../lib/utils/namespaces';
import { areStoresEqual, findAllAttributes } from '../lib/utils/storeUtils';

/**
 * Builds a store from { class: assignedURI }, [child, parent] and [attribute, class] pairs.
 * The given id function turns each class and attribute name into its node in the store.
 */
function buildStore(
  id: (name: string) => RDF.NamedNode,
  classes: Record<string, string>,
  parents: [string, string][],
  attributes: [string, string][],
): QuadStore {
  const df = new DataFactory();
  const store = new QuadStore();
  store.addQuads([
    ...Object.entries(classes).map(([name, uri]) =>
      df.quad(id(name), ns.oslo('assignedURI'), df.namedNode(uri)),
    ),
    ...parents.map(([child, parent]) =>
      df.quad(id(child), ns.rdfs('subClassOf'), id(parent)),
    ),
    ...attributes.map(([attribute, name]) =>
      df.quad(id(attribute), ns.rdfs('domain'), id(name)),
    ),
  ]);
  return store;
}

// Attribute names of the class named `name`, using the same id function as buildStore.
// Sorted: the store does not guarantee an order, duplicates stay visible
function attributesOf(
  name: string,
  store: QuadStore,
  logger: Logger,
  id: (name: string) => RDF.NamedNode,
): string[] {
  return findAllAttributes(id(name), [], store, logger)
    .map((term) => term.value.replace('http://example.org/', ''))
    .sort();
}

describe('QuadStore Utility Functions', () => {
  let store1: QuadStore;
  let store2: QuadStore;
  let store3: QuadStore;
  let store4: QuadStore;
  const df = new DataFactory();

  beforeEach(() => {
    store1 = new QuadStore();
    store2 = new QuadStore();
    store3 = new QuadStore();
    store4 = new QuadStore();
  });

  describe('areStoresEqual', () => {
    it('should return true when both stores are identical', () => {
      const quad1: RDF.Quad = df.quad(
        df.namedNode('http://example.org/subject/1'),
        df.namedNode('http://example.org/predicate/1'),
        df.namedNode('http://example.org/object/1'),
      );
      const quad2: RDF.Quad = df.quad(
        df.namedNode('http://example.org/subject/2'),
        df.namedNode('http://example.org/predicate/2'),
        df.namedNode('http://example.org/object/2'),
      );

      store1.addQuads([quad1, quad2]);
      store2.addQuads([quad1, quad2]);

      expect(areStoresEqual(store1, store2)).toBe(true);
    });

    it('should return false when one store has more quads', () => {
      const quad1: RDF.Quad = df.quad(
        df.namedNode('http://example.org/subject/1'),
        df.namedNode('http://example.org/predicate/1'),
        df.namedNode('http://example.org/object/1'),
      );
      const quad2: RDF.Quad = df.quad(
        df.namedNode('http://example.org/subject/2'),
        df.namedNode('http://example.org/predicate/2'),
        df.namedNode('http://example.org/object/2'),
      );
      const quad3: RDF.Quad = df.quad(
        df.namedNode('http://example.org/subject/3'),
        df.namedNode('http://example.org/predicate/3'),
        df.namedNode('http://example.org/object/3'),
      );

      store1.addQuads([quad1, quad2]);
      store3.addQuads([quad1, quad2, quad3]);

      expect(areStoresEqual(store1, store3)).toBe(false);
    });

    it('should return false when stores have same number of quads but different content', () => {
      const quad1: RDF.Quad = df.quad(
        df.namedNode('http://example.org/subject/1'),
        df.namedNode('http://example.org/predicate/1'),
        df.namedNode('http://example.org/object/1'),
      );
      const quad2: RDF.Quad = df.quad(
        df.namedNode('http://example.org/subject/2'),
        df.namedNode('http://example.org/predicate/2'),
        df.namedNode('http://example.org/object/2'),
      );
      const quad3: RDF.Quad = df.quad(
        df.namedNode('http://example.org/subject/3'),
        df.namedNode('http://example.org/predicate/3'),
        df.namedNode('http://example.org/object/3'),
      );

      store1.addQuads([quad1, quad2]);
      store4.addQuads([quad1, quad3]);

      expect(areStoresEqual(store1, store4)).toBe(false);
    });

    it('should return true when both stores are empty', () => {
      expect(areStoresEqual(store1, store2)).toBe(true);
    });
  });
});

describe('findAllAttributes', () => {
  const df = new DataFactory();
  const id = (name: string): RDF.NamedNode =>
    df.namedNode(`http://example.org/${name}`);
  let logger: Logger;

  beforeEach(() => {
    logger = <Logger>(<unknown>{ warn: jest.fn() });
  });

  it('should collect inherited attributes exactly once', () => {
    const store = buildStore(
      id,
      { A: 'urn:a', B: 'urn:b', C: 'urn:c' },
      [
        ['A', 'B'],
        ['B', 'C'],
      ],
      [
        ['a1', 'A'],
        ['b1', 'B'],
        ['c1', 'C'],
      ],
    );

    expect(attributesOf('A', store, logger, id)).toEqual(['a1', 'b1', 'c1']);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should borrow the attributes of the real class for a dummy parent', () => {
    // Dummy: a copy of the real class with the same URI but without attributes
    const store = buildStore(
      id,
      { Sub: 'urn:sub', Dummy: 'urn:P', Real: 'urn:P' },
      [['Sub', 'Dummy']],
      [
        ['s1', 'Sub'],
        ['r1', 'Real'],
      ],
    );

    expect(attributesOf('Sub', store, logger, id)).toEqual(['r1', 's1']);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should not treat siblings with the same URI as parents', () => {
    const store = buildStore(
      id,
      { PE: 'urn:U', PLE: 'urn:U', DE: 'urn:U' },
      [
        ['PE', 'DE'],
        ['PLE', 'DE'],
      ],
      [
        ['pe', 'PE'],
        ['ple', 'PLE'],
        ['de', 'DE'],
      ],
    );

    expect(attributesOf('PE', store, logger, id)).toEqual(['de', 'pe']);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should not merge descendants of a dummy parent with the same URI', () => {
    // Envelope (dummy, no attributes) <- DataEnvelope <- PregnancyEnvelope, PregnancyListEnvelope
    const store = buildStore(
      id,
      {
        Envelope: 'urn:U',
        DataEnvelope: 'urn:U',
        PregnancyEnvelope: 'urn:U',
        PregnancyListEnvelope: 'urn:U',
      },
      [
        ['DataEnvelope', 'Envelope'],
        ['PregnancyEnvelope', 'DataEnvelope'],
        ['PregnancyListEnvelope', 'DataEnvelope'],
      ],
      [
        ['data', 'DataEnvelope'],
        ['pe', 'PregnancyEnvelope'],
        ['ple', 'PregnancyListEnvelope'],
      ],
    );

    expect(attributesOf('DataEnvelope', store, logger, id)).toEqual(['data']);
    expect(attributesOf('PregnancyEnvelope', store, logger, id)).toEqual([
      'data',
      'pe',
    ]);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should not warn when two parents share an ancestor', () => {
    // Diamond: A inherits from B and C, which both inherit from D
    const store = buildStore(
      id,
      { A: 'urn:a', B: 'urn:b', C: 'urn:c', D: 'urn:d' },
      [
        ['A', 'B'],
        ['A', 'C'],
        ['B', 'D'],
        ['C', 'D'],
      ],
      [
        ['a1', 'A'],
        ['d1', 'D'],
      ],
    );

    expect([...new Set(attributesOf('A', store, logger, id))]).toEqual([
      'a1',
      'd1',
    ]);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should still warn about a real circular inheritance and stop', () => {
    const store = buildStore(
      id,
      { X: 'urn:x', Y: 'urn:y' },
      [
        ['X', 'Y'],
        ['Y', 'X'],
      ],
      [
        ['x1', 'X'],
        ['y1', 'Y'],
      ],
    );

    expect(attributesOf('X', store, logger, id)).toEqual(['x1', 'y1']);
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(
      '[QuadStore]: Circular reference detected for http://example.org/X',
    );
  });

  it('should still warn about a longer circular inheritance and stop', () => {
    // A -> B -> C -> D -> A
    const store = buildStore(
      id,
      { A: 'urn:a', B: 'urn:b', C: 'urn:c', D: 'urn:d' },
      [
        ['A', 'B'],
        ['B', 'C'],
        ['C', 'D'],
        ['D', 'A'],
      ],
      [
        ['a1', 'A'],
        ['b1', 'B'],
        ['c1', 'C'],
        ['d1', 'D'],
      ],
    );

    expect(attributesOf('A', store, logger, id)).toEqual([
      'a1',
      'b1',
      'c1',
      'd1',
    ]);
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(
      '[QuadStore]: Circular reference detected for http://example.org/A',
    );
  });
});
