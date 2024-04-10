/**
 * @group unit
 */
import 'reflect-metadata';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { Constraint } from '../lib/enums/Constraint';
import { GenerationMode } from '../lib/enums/GenerationMode';
import { getGenerationMode, getConstraints, toPascalCase, quadSort } from '../lib/utils/utils';

describe('Util functions', () => {
  const DF: DataFactory = new DataFactory();

  it('should map a string to a GenerationMode', () => {
    expect(getGenerationMode('grouped')).toBe(GenerationMode.Grouped);
    expect(getGenerationMode('individual')).toBe(GenerationMode.Individual);
    expect(() => getGenerationMode('unsupported')).toThrow(new Error(`Generation mode 'unsupported' is not supported.`));
  });

  it('should map an array of strings to an array of Constraints', () => {
    expect(getConstraints([])).toEqual([]);
    const constraintStrings = ['stringsNotEmpty', 'uniqueLanguages', 'nodeKind', 'codelist'];
    const constraints = getConstraints(constraintStrings);
    expect(constraints).toEqual([
      Constraint.StringsNotEmpty,
      Constraint.UniqueLanguage,
      Constraint.NodeKind,
      Constraint.Codelist,
    ]);

    expect(() => getConstraints(['unsupported'])).toThrow(new Error(`Constraint 'unsupported' is not supported.`));
  });

  it('should transform a string to pascal case', () => {
    expect(toPascalCase('test string')).toBe('TestString');
  });

  it('should correctly sort an array of quads', () => {
    const quadA: RDF.Quad = DF.quad(
      DF.blankNode('b'),
      DF.namedNode('http://example.org/predicate'),
      DF.literal('object'),
    );
    const quadB: RDF.Quad = DF.quad(
      DF.namedNode('http://example.org/subject'),
      DF.namedNode('http://example.org/predicate'),
      DF.literal('object'),
    );
    const quadC: RDF.Quad = DF.quad(
      DF.blankNode('a'),
      DF.namedNode('http://example.org/predicate'),
      DF.literal('object'),
    );

    const quads = [quadA, quadB, quadC];
    quads.sort(quadSort);

    expect(quads).toEqual([quadB, quadC, quadA]);
  });
});