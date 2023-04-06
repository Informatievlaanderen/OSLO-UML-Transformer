/**
 * @group unit
 */
import { alphabeticalSort, toCamelCase, toPascalCase } from '../lib/utils/utils';

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
});
