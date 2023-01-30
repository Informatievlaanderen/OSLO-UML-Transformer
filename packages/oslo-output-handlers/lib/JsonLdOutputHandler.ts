import type { WriteStream } from 'fs';
import type { IOutputHandler } from '@oslo-flanders/core';
import { ns } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import type { Store, Quad } from 'n3';
import { getOsloContext } from './utils/osloContext';

export class JsonLdOutputHandler implements IOutputHandler {
  public async write(store: Store<Quad>, writeStream: any): Promise<void> {
    const [packages, classes, attributes, dataTypes, statements] = await Promise.all([
      this.getPackages(store),
      this.getClasses(store),
      this.getAttributes(store),
      this.getDataTypes(store),
      this.getRdfStatements(store),
    ]);

    const document: any = {};
    document['@context'] = getOsloContext();
    this.addDocumentInformation(document, store);

    document.packages = packages;
    document.classes = classes;
    document.attributes = attributes;
    document.dataTypes = dataTypes;
    document.statements = statements;

    (<WriteStream>writeStream).write(JSON.stringify(document, null, 2));
  }

  private addDocumentInformation(document: any, store: Store): void {
    const versionIdQuads = store.getQuads(null, ns.prov('generatedAtTime'), null, null);

    if (!versionIdQuads) {
      throw new Error(`Unnable to find version id for the document.`);
    }

    document['@id'] = versionIdQuads[0].subject.value;
    document.generatedAtTime = versionIdQuads[0].object.value;
  }

  private async getPackages(store: Store<Quad>): Promise<any> {
    const quads = store.getQuads(null, ns.rdf('type'), ns.example('Package'), null);
    return quads.map(quad => {
      const packageQuads = store.getQuads(quad.subject, null, null, null);

      const baseUriValue = packageQuads.find(x => x.predicate.equals(ns.example('baseUri')));
      if (!baseUriValue) {
        throw new Error(`Unnable to find base URI for package with .well-known id ${quad.subject.value}`);
      }

      const assignedUri = packageQuads.find(x => x.predicate.equals(ns.example('assignedUri')));
      return {
        '@id': quad.subject.value,
        '@type': 'Package',
        ...assignedUri && {
          assignedUri: assignedUri.object.value,
        },
        baseUri: baseUriValue.object.value,
      };
    });
  }

  private async getClasses(store: Store<Quad>): Promise<any> {
    const quads = store.getQuads(null, ns.rdf('type'), ns.owl('Class'), null);
    return quads.reduce<any[]>((jsonLdClasses, quad) => {
      // Classes with skos:Concept URI are not being published separately, but only
      // as part of an attribute's range
      if (quad.subject.equals(ns.skos('Concept'))) {
        return jsonLdClasses;
      }

      const classQuads = store.getQuads(quad.subject, null, null, null);

      const assignedUri = classQuads.find(x => x.predicate.equals(ns.example('assignedUri')));
      const definitionQuads = classQuads.filter(x => x.predicate.equals(ns.rdfs('comment')));
      const labelQuads = classQuads.filter(x => x.predicate.equals(ns.rdfs('label')));
      const scopeQuad = classQuads.find(x => x.predicate.equals(ns.example('scope')));
      const parentQuads = classQuads.filter(x => x.predicate.equals(ns.rdfs('subClassOf')));

      jsonLdClasses.push(
        {
          '@id': quad.subject.value,
          '@type': 'Class',
          ...assignedUri && {
            assignedUri: assignedUri.object.value,
          },
          definition: definitionQuads
            .map(x => ({ '@language': (<RDF.Literal>x.object).language, '@value': x.object.value })),
          label: labelQuads.map(x => ({ '@language': (<RDF.Literal>x.object).language, '@value': x.object.value })),
          scope: scopeQuad?.object.value,
          ...parentQuads.length > 0 && {
            parent: parentQuads.map(x => ({ '@id': x.object.value })),
          },
        },
      );

      return jsonLdClasses;
    }, []);
  }

  private async getAttributes(store: Store<Quad>): Promise<any> {
    const dataTypeAttributes = store.getQuads(null, ns.rdf('type'), ns.owl('DatatypeProperty'), null);
    const objectPropertyAttributes = store.getQuads(null, ns.rdf('type'), ns.owl('ObjectProperty'), null);
    const propertyAttributes = store.getQuads(null, ns.rdf('type'), ns.rdf('Property'), null);

    return [
      ...dataTypeAttributes,
      ...objectPropertyAttributes,
      ...propertyAttributes,
    ].map(quad => {
      const attributeQuads = store.getQuads(quad.subject, null, null, null);

      const assignedUri = attributeQuads.find(x => x.predicate.equals(ns.example('assignedUri')));
      const definitionQuads = attributeQuads.filter(x => x.predicate.equals(ns.rdfs('comment')));
      const attributeTypeQuad = attributeQuads
        .find(x => x.subject.equals(quad.subject) && x.predicate.equals(ns.rdf('type')));

      if (!attributeTypeQuad) {
        throw new Error(`Attribute ${quad.subject.value} has no type.`);
      }

      const labelQuads = attributeQuads
        .filter(x => x.subject.equals(quad.subject) && x.predicate.equals(ns.rdfs('label')));
      const usageNoteQuads = attributeQuads.filter(x => x.predicate.equals(ns.vann('usageNote')));

      const domainQuads = attributeQuads.filter(x => x.predicate.equals(ns.rdfs('domain')));
      const rangeQuad = attributeQuads.find(x => x.predicate.equals(ns.rdfs('range')));

      const scopeQuad = attributeQuads.find(x => x.predicate.equals(ns.example('scope')));
      const parentQuad = attributeQuads.find(x => x.predicate.equals(ns.rdfs('subPropertyOf')));
      const minCardinalityQuad = attributeQuads.find(x => x.predicate.equals(ns.shacl('minCount')));
      const maxCardinalityQuad = attributeQuads.find(x => x.predicate.equals(ns.shacl('maxCount')));

      return {
        '@id': quad.subject.value,
        '@type': attributeTypeQuad.object.value,
        ...assignedUri && {
          assignedUri: assignedUri.object.value,
        },
        ...labelQuads.length > 0 && {
          label: labelQuads.map(x => ({ '@language': (<RDF.Literal>x.object).language, '@value': x.object.value })),
        },
        ...definitionQuads.length > 0 && {
          definition: definitionQuads
            .map(x => ({ '@language': (<RDF.Literal>x.object).language, '@value': x.object.value })),
        },
        ...usageNoteQuads.length > 0 && {
          usageNote: usageNoteQuads
            .map(x => ({ '@language': (<RDF.Literal>x.object).language, '@value': x.object.value })),
        },
        ...domainQuads.length > 0 && {
          domain: domainQuads.map(x => ({ '@id': x.object.value })),
        },
        ...rangeQuad && {
          range: {
            '@id': rangeQuad.object.value,
          },
        },
        ...parentQuad && {
          parent: parentQuad.object.value,
        },
        minCount: minCardinalityQuad?.object.value,
        maxCount: maxCardinalityQuad?.object.value,
        scope: scopeQuad?.object.value,
      };
    });
  }

  private async getDataTypes(store: Store<Quad>): Promise<any> {
    const quads = store.getQuads(null, ns.rdf('type'), ns.example('DataType'), null);
    return quads.map(quad => {
      const dataTypeQuads = store.getQuads(quad.subject, null, null, null);

      const assignedUri = dataTypeQuads.find(x => x.predicate.equals(ns.example('assignedUri')));
      const definitionQuads = dataTypeQuads.filter(x => x.predicate.equals(ns.rdfs('comment')));
      const labelQuads = dataTypeQuads.filter(x => x.predicate.equals(ns.rdfs('label')));
      const usageNoteQuads = dataTypeQuads.filter(x => x.predicate.equals(ns.vann('usageNote')));
      const scopeQuad = dataTypeQuads.find(x => x.predicate.equals(ns.example('scope')));

      return {
        '@id': quad.subject.value,
        '@type': 'DataType',
        ...assignedUri && {
          assignedUri: assignedUri.object.value,
        },
        ...labelQuads.length > 0 && {
          label: labelQuads.map(x => ({ '@language': (<RDF.Literal>x.object).language, '@value': x.object.value })),
        },
        ...definitionQuads.length > 0 && {
          definition: definitionQuads
            .map(x => ({ '@language': (<RDF.Literal>x.object).language, '@value': x.object.value })),
        },
        ...usageNoteQuads.length > 0 && {
          usageNote: usageNoteQuads
            .map(x => ({ '@language': (<RDF.Literal>x.object).language, '@value': x.object.value })),
        },
        ...scopeQuad && {
          scope: scopeQuad.object.value,
        },
      };
    });
  }

  private async getRdfStatements(store: Store<Quad>): Promise<any> {
    const statementQuads = store.getQuads(null, ns.rdf('type'), ns.rdf('Statement'), null);
    return statementQuads.map(quad => {
      const statementSubject = store.getQuads(quad.subject, ns.rdf('subject'), null, null).shift()!;
      const statementPredicate = store.getQuads(quad.subject, ns.rdf('predicate'), null, null).shift()!;
      const statementObject = store.getQuads(quad.subject, ns.rdf('object'), null, null).shift()!;

      const statementLabel = store.getQuads(quad.subject, ns.rdfs('label'), null, null).shift();
      const statementDefinitions = store.getQuads(quad.subject, ns.rdfs('comment'), null, null);
      const statementUsageNotes = store.getQuads(quad.subject, ns.vann('usageNote'), null, null);
      const statementConceptScheme = store.getQuads(quad.subject, ns.example('usesConceptScheme'), null, null).shift();

      return {
        '@type': quad.object.value,
        subject: {
          '@id': statementSubject.object.value,
        },
        predicate: {
          '@id': statementPredicate.object.value,
        },
        object: {
          '@id': statementObject.object.value,
        },
        ...statementLabel && {
          label: statementLabel.object.value,
        },
        ...statementDefinitions.length > 0 && {
          definition: statementDefinitions
            .map(x => ({ '@language': (<RDF.Literal>x.object).language, '@value': x.object.value })),
        },
        ...statementUsageNotes.length > 0 && {
          usageNote: statementUsageNotes
            .map(x => ({ '@language': (<RDF.Literal>x.object).language, '@value': x.object.value })),
        },
        ...statementConceptScheme && {
          usesConceptScheme: statementConceptScheme.object.value,
        },
      };
    });
  }
}
