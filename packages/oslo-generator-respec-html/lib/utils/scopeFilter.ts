import type { QuadStore } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';

export function isInScope(subject: RDF.NamedNode, store: QuadStore): RDF.NamedNode | null {
  const scope = store.getScope(subject);

  if (!scope || scope.value !== 'https://data.vlaanderen.be/id/concept/scope/InPackage') {
    return null;
  }

  return scope;
}
