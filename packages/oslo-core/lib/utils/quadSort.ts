import type * as RDF from '@rdfjs/types';

/**
 * Sort function used on an array of quads. First sorts named nodes alphabetically, then blank nodes alphabetically.
 * @param quadA An RDF.Quad
 * @param quadB An RDF.Quad
 * @returns a number
 */
export const quadSort = (quadA: RDF.Quad, quadB: RDF.Quad): number => {
  if (quadA.subject.termType === quadB.subject.termType) {
    return quadA.subject.value.localeCompare(quadB.subject.value);
  }

  return quadA.subject.termType === 'BlankNode' ? 1 : -1;
};
