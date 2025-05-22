import type { WriteStream } from 'fs';
import { createWriteStream } from 'fs';
import { ns } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import * as N3 from 'n3';

/**
 * Reads the triples from an N3.Store to a stream
 * @param store — an N3 RDF store
 * @param format — The format in which the output must be written (an RDF serialisation)
 */
export function storeToRDF(store: N3.Store, format: string): void {
  return format === 'application/ld+json' ? serialiseToJsonLd(store) : serialiseToTriG(store);
}

function serialiseToTriG(store: N3.Store): void {
  const writer = new N3.Writer(createWriteStream('report.trig'), { format: 'application/trig' });

  writer.addQuads(store.getQuads(null, null, null, null));
  writer.end();
}

function serialiseToJsonLd(store: N3.Store): void {
  const document: any = {};
  document.packages = getPackagesAsJsonLd(store);
  document.classes = getClassesAsJsonLd(store);

  const writeStream: any = process.stdout;

  (<WriteStream>writeStream).write(JSON.stringify(document));

  // Const stream = createWriteStream(process.stdout);
  // stream.write(JSON.stringify(document, null, 2));
  //
  // writeFileSync('report-test-output.jsonld', JSON.stringify(document, null, 2));
}

function getPackagesAsJsonLd(store: N3.Store): any {
  const packageSubjectGraphQuads = store.getQuads(null, ns.rdf('type'), ns.example('Package'), null);
  return packageSubjectGraphQuads.map(quad => {
    const packageQuads = store.getQuads(null, null, null, quad.graph);

    const baseUriValues = packageQuads.filter(x => x.predicate.equals(ns.example('baseUri')));
    if (baseUriValues.length === 0) {
      throw new Error(`Unnable to find base URI for package with .well-known id ${quad.graph.value}`);
    }

    return {
      '@id': quad.graph.value,
      '@graph': {
        '@id': quad.subject.value,
        '@type': 'Package',
        baseUri: baseUriValues[0].object.value,
      },
    };
  });
}

function getClassesAsJsonLd(store: N3.Store): any {
  const classSubjectGraphQuads = store.getQuads(null, ns.rdf('type'), ns.owl('Class'), null);
  return classSubjectGraphQuads.reduce<any[]>((jsonLdClasses, quad) => {
    // Skos:Concept classes are not being published separately, but only
    // as part of an attribute's range
    if (quad.subject.equals(ns.skos('Concept'))) {
      return jsonLdClasses;
    }

    const classQuads = store.getQuads(null, null, null, quad.graph);

    const definitionQuads = classQuads.filter(x => x.predicate.equals(ns.rdfs('comment')));
    const labelQuads = classQuads.filter(x => x.predicate.equals(ns.rdfs('label')));
    const scopeQuad = classQuads.find(x => x.predicate.equals(ns.example('scope')));
    const parentQuads = classQuads.filter(x => x.predicate.equals(ns.rdfs('subClassOf')));

    const parentLabelQuads: RDF.Quad[] = [];
    if (parentQuads.length > 0) {
      parentQuads.forEach(parentQuad => {
        parentLabelQuads.push(...store.getQuads(parentQuad.object, ns.rdfs('label'), null, null));
      });
    }

    jsonLdClasses.push(
      {
        '@id': quad.graph.value,
        '@graph': {
          '@id': quad.subject.value,
          '@type': 'Class',
          definition: definitionQuads
            .map(x => ({ '@language': (<RDF.Literal>x.object).language, '@value': x.object.value })),
          label: labelQuads.map(x => ({ '@language': (<RDF.Literal>x.object).language, '@value': x.object.value })),
          scope: scopeQuad?.object.value,
          ...parentQuads.length > 0 && {
            parent: parentLabelQuads
              .map(x => ({
                '@id': x.subject.value,
                label: { '@language': (<RDF.Literal>x.object).language, '@value': x.object.value },
              })),
          },
        },
      },
    );

    return jsonLdClasses;
  }, []);
}

