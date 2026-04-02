import type { Logger } from '@oslo-flanders/core';

import {
  DEFAULT_DATASOURCE,
  REFERENCE_FORMULATION_MAP,
} from '../constants/Rml';
import type { RmlDataSourceInfo, RmlMappingConfig } from '../types/Rml';

export function resolveDataSource(
  label: string,
  mapping: RmlMappingConfig | undefined,
  logger: Logger,
): RmlDataSourceInfo {
  if (!mapping || !(label in mapping.datasources)) {
    return { ...DEFAULT_DATASOURCE };
  }

  const ds = mapping.datasources[label];
  if (!ds.source) {
    return { ...DEFAULT_DATASOURCE };
  }

  const entry = REFERENCE_FORMULATION_MAP[ds.referenceFormulation];
  if (!entry) {
    logger.error(
      `Reference Formulation "${ds.referenceFormulation}" not implemented`,
    );
    return { ...DEFAULT_DATASOURCE };
  }

  return {
    source: ds.source,
    referenceFormulation: entry.rmlValue,
    iterator: entry.hasIterator ? ds.iterator : undefined,
  };
}
