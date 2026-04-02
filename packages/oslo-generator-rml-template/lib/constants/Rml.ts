import { ns } from '@oslo-flanders/core';
import { ReferenceFormulation } from '../enums/ReferenceFormulation';
import type { RmlDataSourceInfo } from '../types/Rml';

export const REFERENCE_FORMULATION_MAP: Record<
  string,
  { rmlValue: string; hasIterator: boolean }
> = {
  [ReferenceFormulation.Csv]: {
    rmlValue: ns.rml('CSV').value,
    hasIterator: false,
  },
  [ReferenceFormulation.Json]: {
    rmlValue: ns.rml('JSONPath').value,
    hasIterator: true,
  },
  [ReferenceFormulation.Xml]: {
    rmlValue: ns.rml('XPath').value,
    hasIterator: true,
  },
};

export const DEFAULT_DATASOURCE: RmlDataSourceInfo = {
  source: 'test.csv',
  referenceFormulation: ns.rml('CSV').value,
};
