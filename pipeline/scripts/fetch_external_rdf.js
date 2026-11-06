#!/usr/bin/env node

const fs = require('fs');
const { rdfDereferencer } = require('rdf-dereference');

// Serialize a single RDFJS term to its N-Quads representation.
function serializeTerm(term) {
  if (term.termType === 'NamedNode') {
    return `<${term.value}>`;
  }
  if (term.termType === 'BlankNode') {
    return `_:${term.value}`;
  }
  if (term.termType === 'Literal') {
    const escaped = term.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
    if (term.language) {
      return `"${escaped}"@${term.language}`;
    }
    if (term.datatype && term.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string') {
      return `"${escaped}"^^<${term.datatype.value}>`;
    }
    return `"${escaped}"`;
  }
  if (term.termType === 'DefaultGraph') {
    return '';
  }
  return `<${term.value}>`;
}

// Serialize a single RDFJS quad to an N-Quads line.
function serializeQuad(quad) {
  const { subject, predicate, object, graph } = quad;
  const graphPart = graph && graph.termType !== 'DefaultGraph' ? ` ${serializeTerm(graph)}` : '';
  return `${serializeTerm(subject)} ${serializeTerm(predicate)} ${serializeTerm(object)}${graphPart} .\n`;
}

function serializeQuadsAsNQuads(quads) {
  return quads.map((quad) => serializeQuad(quad)).join('');
}

// Emit Turtle-like text when all quads are in the default graph.
function serializeQuadsAsTurtle(quads) {
  const subjects = new Map();

  for (const quad of quads) {
    const subject = serializeTerm(quad.subject);
    const predicate = serializeTerm(quad.predicate);
    const object = serializeTerm(quad.object);

    if (!subjects.has(subject)) {
      subjects.set(subject, new Map());
    }

    const predicates = subjects.get(subject);
    if (!predicates.has(predicate)) {
      predicates.set(predicate, []);
    }
    predicates.get(predicate).push(object);
  }

  const blocks = [];

  for (const [subject, predicates] of subjects) {
    const predicateLines = [];
    let index = 0;

    for (const [predicate, objects] of predicates) {
      const objectList = objects.join(', ');
      if (index === 0) {
        predicateLines.push(`${subject} ${predicate} ${objectList}`);
      } else {
        predicateLines.push(`  ${predicate} ${objectList}`);
      }
      index += 1;
    }

    blocks.push(`${predicateLines.join(' ;\n')} .`);
  }

  return `${blocks.join('\n\n')}\n`;
}

async function main() {
  const [, , sourceUrl, targetFile] = process.argv;

  if (!sourceUrl || !targetFile) {
    console.error('Usage: fetch_external_rdf.js <source-url> <target-file>');
    process.exit(1);
  }

  const { data, headers, url } = await rdfDereferencer.dereference(sourceUrl, {
    parseUnsupportedVersions: true,
  });

  const quads = [];

  await new Promise((resolve, reject) => {
    data.on('data', (quad) => quads.push(quad));
    data.on('error', reject);
    data.on('end', resolve);
  });

  if (quads.length === 0) {
    throw new Error(`No RDF quads were dereferenced from ${sourceUrl}`);
  }

  const canSerializeAsTurtle = quads.every(
    (quad) => quad.graph && quad.graph.termType === 'DefaultGraph',
  );

  const serialized = canSerializeAsTurtle
    ? serializeQuadsAsTurtle(quads)
    : serializeQuadsAsNQuads(quads);

  fs.writeFileSync(targetFile, serialized, 'utf8');

  const contentType = headers && typeof headers.get === 'function'
    ? headers.get('content-type')
    : 'unknown';

  const outputFormat = canSerializeAsTurtle ? 'text/turtle' : 'application/n-quads';
  console.log(`Fetched external source: ${url || sourceUrl} (${contentType || 'unknown'}) -> ${outputFormat}`);
}

main().catch((error) => {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
});