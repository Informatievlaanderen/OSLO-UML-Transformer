/**
 * @group unit
 */
import { toCamelCase, toPascalCase } from '../lib/utils/utils';

describe('Utils functions', () => {
  it('should format a string to pascal case', () => {
    expect(toPascalCase('test name')).toBe('TestName');
  });

  it('should format a string to camel case', () => {
    expect(toCamelCase('test name')).toBe('testName');
  });
});
