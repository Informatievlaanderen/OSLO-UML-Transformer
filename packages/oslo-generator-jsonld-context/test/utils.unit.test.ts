/**
 * @group unit
 */
import { ns } from '@oslo-flanders/core';
import * as N3 from 'n3';
import { DataFactory } from 'rdf-data-factory';
import { alphabeticalSort, getLabel, toCamelCase, toPascalCase } from '../lib/utils/utils';

describe('Utils functions', () => {
  it('should format a string to pascal case', () => {
    expect(toPascalCase('test name')).toBe('TestName');
  });

  it('should format a string to camel case', () => {
    expect(toCamelCase('test name')).toBe('testName');
  });

  it('should perform an alphabetical sort on a map using its keys', () => {
    const map: Map<string, string> = new Map();
    map.set('B', 'B');
    map.set('A', 'A');

    expect(Array.from(map.entries())).toEqual([['B', 'B'], ['A', 'A']]);
    expect(alphabeticalSort(Array.from(map.entries()))).toEqual([['A', 'A'], ['B', 'B']]);
  });

  it('should return an rdfs:label in the desired language or undefined', () => {
    const df = new DataFactory();
    const store = new N3.Store(
      [
        df.quad(
          df.namedNode('http://example.org/id/1'),
          ns.rdfs('label'),
          df.literal('Test', 'en'),
        ),
      ],
    );

    const subject = store.getSubjects(null, null, null).find(x => x === df.namedNode('http://example.org/id/1'))!;

    expect(getLabel(subject, 'en', store)!.value).toBe('Test');
    expect(getLabel(subject, 'nl', store)).toBe(undefined);
  });
});
