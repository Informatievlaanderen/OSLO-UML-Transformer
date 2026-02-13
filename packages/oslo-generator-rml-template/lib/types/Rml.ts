export interface RmlPredicateObjectMap {
  predicate: string;
  object?: string | undefined;
  child?: string | undefined;
  parent?: string | undefined;
  parentTriplesMap?: string | undefined;
  datatype?: string | undefined;
  language?: string | undefined;
  referenceType?: string | undefined;
}

export interface RmlMappingVariable {
  key: string;
  value: string;
  referenceType?: string;
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
