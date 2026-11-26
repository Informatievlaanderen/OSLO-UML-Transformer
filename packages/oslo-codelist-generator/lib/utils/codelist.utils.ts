import { ns } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import type { DataFactory } from 'rdf-data-factory';

export function addPrefLabel(
  quads: RDF.Quad[],
  df: DataFactory,
  conceptUri: RDF.NamedNode,
  label: string | undefined,
  language: string,
): void {
  if (label) {
    quads.push(
      df.quad(conceptUri, ns.skos('prefLabel'), df.literal(label, language)),
    );
  }
}

export function addDefinition(
  quads: RDF.Quad[],
  df: DataFactory,
  conceptUri: RDF.NamedNode,
  definition: string | undefined,
  language: string,
): void {
  if (definition) {
    quads.push(
      df.quad(
        conceptUri,
        ns.skos('definition'),
        df.literal(definition, language),
      ),
    );
  }
}

export function addNotation(
  quads: RDF.Quad[],
  df: DataFactory,
  conceptUri: RDF.NamedNode,
  notation: string | undefined,
): void {
  if (notation) {
    quads.push(df.quad(conceptUri, ns.skos('notation'), df.literal(notation)));
  }
}

export function addHasPart(
  quads: RDF.Quad[],
  df: DataFactory,
  parentUri: RDF.NamedNode,
  childUri: string | undefined,
): void {
  if (childUri && childUri !== 'null') {
    quads.push(
      df.quad(parentUri, ns.dcterms('hasPart'), df.namedNode(childUri)),
    );
  }
}

export function addInScheme(
  quads: RDF.Quad[],
  df: DataFactory,
  subjectUri: RDF.NamedNode,
  inScheme: string | undefined,
  isConceptScheme = false,
): void {
  if (inScheme && inScheme !== 'null') {
    const predicate = isConceptScheme ? ns.dcterms('isPartOf') : ns.skos('inScheme');
    quads.push(
      df.quad(subjectUri, predicate, df.namedNode(inScheme)),
    );
  }
}

export function addTopConceptOf(
  quads: RDF.Quad[],
  df: DataFactory,
  subjectUri: RDF.NamedNode,
  topConceptOf: string | undefined,
  isConceptScheme = false,
): void {
  if (topConceptOf && topConceptOf !== 'null') {
    const predicate = isConceptScheme ? ns.dcterms('isPartOf') : ns.skos('topConceptOf');
    quads.push(
      df.quad(subjectUri, predicate, df.namedNode(topConceptOf)),
    );
  }
}

export function addNarrowerConcepts(
  quads: RDF.Quad[],
  df: DataFactory,
  conceptUri: RDF.NamedNode,
  narrowerColumn: string | undefined,
): void {
  if (narrowerColumn && narrowerColumn !== 'null') {
    const narrowerConcepts = narrowerColumn.split('|');
    for (const narrowerConcept of narrowerConcepts) {
      if (narrowerConcept && narrowerConcept.trim() !== 'null') {
        quads.push(
          df.quad(
            conceptUri,
            ns.skos('narrower'),
            df.namedNode(narrowerConcept.trim()),
          ),
        );
      }
    }
  }
}

export function addBroaderConcepts(
  quads: RDF.Quad[],
  df: DataFactory,
  conceptUri: RDF.NamedNode,
  broaderColumn: string | undefined,
): void {
  if (broaderColumn && broaderColumn !== 'null') {
    const broaderConcepts = broaderColumn.split('|');
    for (const broaderConcept of broaderConcepts) {
      if (broaderConcept && broaderConcept.trim() !== 'null') {
        quads.push(
          df.quad(
            conceptUri,
            ns.skos('broader'),
            df.namedNode(broaderConcept.trim()),
          ),
        );
      }
    }
  }
}

export function addStatus(
  quads: RDF.Quad[],
  df: DataFactory,
  conceptUri: RDF.NamedNode,
  status: string | undefined,
): void {
  if (status && status !== 'null') {
    quads.push(df.quad(conceptUri, ns.skos('status'), df.namedNode(status)));
  }
}

export function addDataset(
  quads: RDF.Quad[],
  df: DataFactory,
  conceptUri: RDF.NamedNode,
  dataset: string | undefined,
): void {
  if (dataset && dataset !== 'null') {
    quads.push(
      df.quad(conceptUri, ns.dcat('inCatalog'), df.namedNode(dataset)),
    );
  }
}

export function extractNamespaces(
  term: RDF.Term | undefined,
  namespaces: Set<string>,
): void {
  if (!term || term.termType !== 'NamedNode') {
    return;
  }

  const value = term.value;
  // Extract namespace by finding the last occurrence of # or /
  const hashIndex = value.lastIndexOf('#');
  const slashIndex = value.lastIndexOf('/');
  const splitIndex = Math.max(hashIndex, slashIndex);

  if (splitIndex > 0) {
    const namespace = value.slice(0, Math.max(0, splitIndex + 1));
    namespaces.add(namespace);
  }
}

export function formatOutput(result: string): string {
  // Extract all @prefix declarations
  const prefixRegex = /(@prefix\s+\w+:\s+<[^>]+>\s*\.)/gu;
  const prefixes = result.match(prefixRegex) || [];

  // Build the prefix section with consistent formatting
  const prefixSection = prefixes.map((prefix) => prefix.trim()).join('\n');

  // Remove prefix declarations from the result to get only the quads
  let quadsSection = result;
  for (const prefix of prefixes) {
    quadsSection = quadsSection.replace(prefix, '');
  }

  // Format the quads - remove existing periods first, then add them back
  const formattedQuads = quadsSection
    .split('.\n')
    .filter((line) => line.trim() !== '')
    .map((line) => {
      // Remove any trailing periods that might already exist
      const cleanedLine = line.trim().replace(/\.+$/gu, '');
      return `${cleanedLine}.\n`;
    })
    .join('');

  // Recombine prefixes with a blank line, then quads
  return prefixSection
    ? `${prefixSection}\n\n${formattedQuads}`
    : formattedQuads;
}
