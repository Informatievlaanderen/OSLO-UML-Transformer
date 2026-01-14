/**
 * @group unit
 */

import 'reflect-metadata';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { QuadStore } from '../lib/store/QuadStore';
import { areStoresEqual } from '../lib/utils/storeUtils';

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
