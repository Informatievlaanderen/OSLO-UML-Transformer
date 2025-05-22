import type { WriteStream } from 'fs';
import type { IOutputHandler, QuadStore } from '@oslo-flanders/core';
import { ns } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { getOsloContext } from './utils/osloContext';

export class JsonLdOutputHandler implements IOutputHandler {
  public async write(store: QuadStore, writeStream: any): Promise<void> {
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

  private addDocumentInformation(document: any, store: QuadStore): void {
    const versionIdQuad = store.findQuad(null, ns.prov('generatedAtTime'), null);

    if (!versionIdQuad) {
      throw new Error(`Unnable to find version id for the document.`);
    }

    document['@id'] = versionIdQuad.subject.value;
    document.generatedAtTime = versionIdQuad.object.value;
  }

  private async getPackages(store: QuadStore): Promise<any> {
    const packageIds = store.findSubjects(ns.rdf('type'), ns.example('Package'));
    return packageIds.map(id => {
      const packageQuads = store.findQuads(id, null, null);

      const baseUriValue = packageQuads.find(x => x.predicate.equals(ns.example('baseUri')));
      if (!baseUriValue) {
        throw new Error(`Unnable to find base URI for package with .well-known id ${id.value}`);
      }

      const assignedUri = packageQuads.find(x => x.predicate.equals(ns.example('assignedUri')));
      return {
        '@id': id.value,
        '@type': 'Package',
        ...assignedUri && {
          assignedUri: assignedUri.object.value,
        },
        baseUri: baseUriValue.object.value,
      };
    });
  }

  private async getClasses(store: QuadStore): Promise<any> {
    const classIds = store.findSubjects(ns.rdf('type'), ns.owl('Class'));
    return classIds.reduce<any[]>((jsonLdClasses, subject) => {
      // Classes with skos:Concept URI are not being published separately, but only
      // as part of an attribute's range
      if (subject.equals(ns.skos('Concept'))) {
        return jsonLdClasses;
      }

      const classQuads = store.findQuads(subject, null, null);

      const assignedUri = classQuads.find(x => x.predicate.equals(ns.example('assignedUri')));
      const definitionQuads = classQuads.filter(x => x.predicate.equals(ns.rdfs('comment')));
      const labelQuads = classQuads.filter(x => x.predicate.equals(ns.rdfs('label')));
      const scopeQuad = classQuads.find(x => x.predicate.equals(ns.example('scope')));
      const parentQuads = classQuads.filter(x => x.predicate.equals(ns.rdfs('subClassOf')));

      jsonLdClasses.push(
        {
          '@id': subject.value,
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

  private async getAttributes(store: QuadStore): Promise<any> {
    const dataTypeAttributeIds = store.findSubjects(ns.rdf('type'), ns.owl('DatatypeProperty'));
    const objectPropertyAttributeIds = store.findSubjects(ns.rdf('type'), ns.owl('ObjectProperty'));
    const propertyAttributeIds = store.findSubjects(ns.rdf('type'), ns.rdf('Property'));

    return [
      ...dataTypeAttributeIds,
      ...objectPropertyAttributeIds,
      ...propertyAttributeIds,
    ].map(subject => {
      const attributeQuads = store.findQuads(subject, null, null);

      const assignedUri = attributeQuads.find(x => x.predicate.equals(ns.example('assignedUri')));
      const definitionQuads = attributeQuads.filter(x => x.predicate.equals(ns.rdfs('comment')));
      const attributeTypeQuad = attributeQuads
        .find(x => x.subject.equals(subject) && x.predicate.equals(ns.rdf('type')));

      if (!attributeTypeQuad) {
        throw new Error(`Attribute ${subject.value} has no type.`);
      }

      const labelQuads = attributeQuads
        .filter(x => x.subject.equals(subject) && x.predicate.equals(ns.rdfs('label')));
      const usageNoteQuads = attributeQuads.filter(x => x.predicate.equals(ns.vann('usageNote')));

      const domainQuads = attributeQuads.filter(x => x.predicate.equals(ns.rdfs('domain')));
      const rangeQuad = attributeQuads.find(x => x.predicate.equals(ns.rdfs('range')));

      const scopeQuad = attributeQuads.find(x => x.predicate.equals(ns.example('scope')));
      const parentQuad = attributeQuads.find(x => x.predicate.equals(ns.rdfs('subPropertyOf')));
      const minCardinalityQuad = attributeQuads.find(x => x.predicate.equals(ns.shacl('minCount')));
      const maxCardinalityQuad = attributeQuads.find(x => x.predicate.equals(ns.shacl('maxCount')));

      return {
        '@id': subject.value,
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

  private async getDataTypes(store: QuadStore): Promise<any> {
    const datatypeIds = store.findSubjects(ns.rdf('type'), ns.example('DataType'));
    return datatypeIds.map(subject => {
      const dataTypeQuads = store.findQuads(subject, null, null);

      const assignedUri = dataTypeQuads.find(x => x.predicate.equals(ns.example('assignedUri')));
      const definitionQuads = dataTypeQuads.filter(x => x.predicate.equals(ns.rdfs('comment')));
      const labelQuads = dataTypeQuads.filter(x => x.predicate.equals(ns.rdfs('label')));
      const usageNoteQuads = dataTypeQuads.filter(x => x.predicate.equals(ns.vann('usageNote')));
      const scopeQuad = dataTypeQuads.find(x => x.predicate.equals(ns.example('scope')));

      return {
        '@id': subject.value,
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

  private async getRdfStatements(store: QuadStore): Promise<any> {
    const statementIds = store.findSubjects(ns.rdf('type'), ns.rdf('Statement'));
    return statementIds.map(subject => {
      const statementSubject = store.findObject(subject, ns.rdf('subject'));
      const statementPredicate = store.findObject(subject, ns.rdf('predicate'));
      const statementObject = store.findObject(subject, ns.rdf('object'));

      const statementLabels = store.findObjects(subject, ns.rdfs('label'));
      const statementDefinitions = store.findObjects(subject, ns.rdfs('comment'));
      const statementUsageNotes = store.findObjects(subject, ns.vann('usageNote'));
      const statementConceptScheme = store.findObject(subject, ns.example('usesConceptScheme'));

      return {
        '@type': ns.rdf('Statement').value,
        subject: {
          '@id': statementSubject?.value,
        },
        predicate: {
          '@id': statementPredicate?.value,
        },
        object: {
          '@id': statementObject?.value,
        },
        ...statementLabels.length > 0 && {
          label: statementLabels
            .map(x => ({ '@language': (<RDF.Literal>x).language, '@value': x.value })),
        },
        ...statementDefinitions.length > 0 && {
          definition: statementDefinitions
            .map(x => ({ '@language': (<RDF.Literal>x).language, '@value': x.value })),
        },
        ...statementUsageNotes.length > 0 && {
          usageNote: statementUsageNotes
            .map(x => ({ '@language': (<RDF.Literal>x).language, '@value': x.value })),
        },
        ...statementConceptScheme && {
          usesConceptScheme: statementConceptScheme.value,
        },
      };
    });
  }
}
