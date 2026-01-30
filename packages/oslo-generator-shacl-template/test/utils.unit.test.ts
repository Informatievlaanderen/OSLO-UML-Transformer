/**
 * @group unit
 */
import 'reflect-metadata';
import { DataFactory } from 'rdf-data-factory';
import { Constraint } from '../lib/enums/Constraint';
import { GenerationMode } from '../lib/enums/GenerationMode';
import { getGenerationMode, getConstraints } from '../lib/utils/utils';

describe('Util functions', () => {
  const DF: DataFactory = new DataFactory();

  it('should map a string to a GenerationMode', () => {
    expect(getGenerationMode('grouped')).toBe(GenerationMode.Grouped);
    expect(getGenerationMode('individual')).toBe(GenerationMode.Individual);
    expect(() => getGenerationMode('unsupported')).toThrow(
      new Error(`Generation mode 'unsupported' is not supported.`),
    );
  });

  it('should map an array of strings to an array of Constraints', () => {
    expect(getConstraints([])).toEqual([]);
    const constraintStrings = [
      'stringsNotEmpty',
      'uniqueLanguages',
      'nodeKind',
      'codelist',
    ];
    const constraints = getConstraints(constraintStrings);
    expect(constraints).toEqual([
      Constraint.StringsNotEmpty,
      Constraint.UniqueLanguage,
      Constraint.NodeKind,
      Constraint.Codelist,
    ]);

    expect(() => getConstraints(['unsupported'])).toThrow(
      new Error(`Constraint 'unsupported' is not supported.`),
    );
  });
});
