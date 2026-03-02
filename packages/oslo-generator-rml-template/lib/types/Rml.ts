export interface RmlPredicateObjectMap {
  predicate: string;
  object: string;
  child: string;
  parent: string;
  parentTriplesMap: string;
  datatype: string;
  language: string;
  referenceType?: string;
}

export interface RmlMappingVariable {
  key: string;
  value: string;
  referenceType?: string;
  termType?: string;
}

export type RmlMappingDatasource = Record<string, RmlMappingDatasourceValue>;

export interface RmlMappingDatasourceValue {
  source: string;
  referenceFormulation: string;
  iterator?: string;
}

export interface RmlMappingConfig {
  variables: RmlMappingVariable[];
  datasources: RmlMappingDatasource;
}

export interface RmlDataSourceInfo {
  source: string;
  referenceFormulation: string;
  iterator?: string;
}

export interface RmlSubjectMap {
  template: string;
  referenceType?: string;
  termType?: string;
  class: string
}

export interface RmlTriplesMap {
  subjectMap: RmlSubjectMap;
  predicateObjectMaps: RmlPredicateObjectMap[];
  label: string;
}

export interface RmlTripleMapEntry {
  subKey: string;
  origin: string;
  property: string;
}
