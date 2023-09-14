import type { WriteStream } from 'fs';
import type { IOutputHandler, Logger, QuadStore } from '@oslo-flanders/core';
import { ns } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { getOsloContext } from './utils/osloContext';

export class JsonLdOutputHandler implements IOutputHandler {
  public async write(store: QuadStore, writeStream: any): Promise<void> {
    const [packages, classes, attributes, dataTypes, statements] =
      await Promise.all([
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
    document.datatypes = dataTypes;
    document.statements = statements;

    (<WriteStream>writeStream).write(JSON.stringify(document, null, 2));
  }

  private addDocumentInformation(document: any, store: QuadStore): void {
    const versionIdQuad = store.findQuad(
      null,
      ns.prov('generatedAtTime'),
      null
    );

    if (!versionIdQuad) {
      throw new Error(`Unnable to find version id for the document.`);
    }

    document['@id'] = versionIdQuad.subject.value;
    document.generatedAtTime = versionIdQuad.object.value;
  }

  private async getPackages(store: QuadStore): Promise<any> {
    const packageIds = store.findSubjects(
      ns.rdf('type'),
      ns.example('Package')
    );
    return packageIds.map((id) => {
      const packageQuads = store.findQuads(id, null, null);

      const baseUriValue = packageQuads.find((x) =>
        x.predicate.equals(ns.example('baseUri'))
      );
      if (!baseUriValue) {
        throw new Error(
          `Unnable to find base URI for package with .well-known id ${id.value}`
        );
      }

      const assignedUri = packageQuads.find((x) =>
        x.predicate.equals(ns.example('assignedUri'))
      );
      return {
        '@id': id.value,
        '@type': 'Package',
        ...(assignedUri && {
          assignedUri: assignedUri.object.value,
        }),
        baseUri: baseUriValue.object.value,
      };
    });
  }

  private async getClasses(store: QuadStore): Promise<any> {
    const classIds = store.findSubjects(ns.rdf('type'), ns.owl('Class'));
    return classIds.reduce<any[]>((jsonLdClasses, subject) => {
      const assignedUri = store.getAssignedUri(subject);

      // TODO: logging should happen here
      if (!assignedUri) {
        return jsonLdClasses;
      }

      // Classes with skos:Concept URI are not being published separately, but only
      // as part of an attribute's range
      if (assignedUri.equals(ns.skos('Concept'))) {
        return jsonLdClasses;
      }

      const definitionQuads = store.getDefinitions(subject);
      const labelQuads = store.getLabels(subject);
      const scopeQuad = store.getScope(subject);
      const parentQuads = store.getParentsOfClass(subject);

      jsonLdClasses.push({
        '@id': subject.value,
        '@type': 'Class',
        ...(assignedUri && {
          assignedUri: assignedUri.value,
        }),
        definition: definitionQuads.map((x) => ({
          '@language': (<RDF.Literal>x).language,
          '@value': x.value,
        })),
        label: labelQuads.map((x) => ({
          '@language': (<RDF.Literal>x).language,
          '@value': x.value,
        })),
        scope: scopeQuad?.value,
        ...(parentQuads.length > 0 && {
          parent: parentQuads.map((x) => ({ '@id': x.value })),
        }),
      });

      return jsonLdClasses;
    }, []);
  }

  private async getAttributes(store: QuadStore): Promise<any> {
    const dataTypeAttributeIds = store.findSubjects(
      ns.rdf('type'),
      ns.owl('DatatypeProperty')
    );
    const objectPropertyAttributeIds = store.findSubjects(
      ns.rdf('type'),
      ns.owl('ObjectProperty')
    );
    const propertyAttributeIds = store.findSubjects(
      ns.rdf('type'),
      ns.rdf('Property')
    );

    return [
      ...dataTypeAttributeIds,
      ...objectPropertyAttributeIds,
      ...propertyAttributeIds,
    ].map((subject) => {
      const assignedUri = store.getAssignedUri(subject);
      const definitionQuads = store.getDefinitions(subject);
      const attributeTypeQuad = store.findObject(subject, ns.rdf('type'));

      const labelQuads = store.getLabels(subject);
      const usageNoteQuads = store.getUsageNotes(subject);

      const domainQuad = store.getDomain(subject);
      const rangeQuad = store.getRange(subject);

      const scopeQuad = store.getScope(subject);
      const parentQuad = store.getParentOfProperty(subject);
      const minCardinalityQuad = store.getMinCardinality(subject);
      const maxCardinalityQuad = store.getMaxCardinality(subject);

      return {
        '@id': subject.value,
        '@type': attributeTypeQuad?.value,
        ...(assignedUri && {
          assignedUri: assignedUri.value,
        }),
        ...(labelQuads.length > 0 && {
          label: labelQuads.map((x) => ({
            '@language': (<RDF.Literal>x).language,
            '@value': x.value,
          })),
        }),
        ...(definitionQuads.length > 0 && {
          definition: definitionQuads.map((x) => ({
            '@language': (<RDF.Literal>x).language,
            '@value': x.value,
          })),
        }),
        ...(usageNoteQuads.length > 0 && {
          usageNote: usageNoteQuads.map((x) => ({
            '@language': (<RDF.Literal>x).language,
            '@value': x.value,
          })),
        }),
        ...(domainQuad && {
          domain: {
            '@id': domainQuad.value,
          },
        }),
        ...(rangeQuad && {
          range: {
            '@id': rangeQuad.value,
          },
        }),
        ...(parentQuad && {
          parent: {
            '@id': parentQuad.value,
          },
        }),
        minCount: minCardinalityQuad?.value,
        maxCount: maxCardinalityQuad?.value,
        scope: scopeQuad?.value,
      };
    });
  }

  private async getDataTypes(store: QuadStore): Promise<any> {
    const datatypeIds = store.findSubjects(ns.rdf('type'), ns.rdfs('Datatype'));
    return datatypeIds.map((subject) => {
      const assignedUri = store.getAssignedUri(subject);
      const definitionQuads = store.getDefinitions(subject);
      const labelQuads = store.getLabels(subject);
      const usageNoteQuads = store.getUsageNotes(subject);
      const scopeQuad = store.getScope(subject);

      return {
        '@id': subject.value,
        '@type': 'DataType',
        ...(assignedUri && {
          assignedUri: assignedUri.value,
        }),
        ...(labelQuads.length > 0 && {
          label: labelQuads.map((x) => ({
            '@language': (<RDF.Literal>x).language,
            '@value': x.value,
          })),
        }),
        ...(definitionQuads.length > 0 && {
          definition: definitionQuads.map((x) => ({
            '@language': (<RDF.Literal>x).language,
            '@value': x.value,
          })),
        }),
        ...(usageNoteQuads.length > 0 && {
          usageNote: usageNoteQuads.map((x) => ({
            '@language': (<RDF.Literal>x).language,
            '@value': x.value,
          })),
        }),
        ...(scopeQuad && {
          scope: scopeQuad.value,
        }),
      };
    });
  }

  private async getRdfStatements(store: QuadStore): Promise<any> {
    const statementIds = store.findSubjects(
      ns.rdf('type'),
      ns.rdf('Statement')
    );
    return statementIds.map((subject) => {
      const statementSubject = store.findObject(subject, ns.rdf('subject'));
      const statementPredicate = store.findObject(subject, ns.rdf('predicate'));
      const statementObject = store.findObject(subject, ns.rdf('object'));

      const statementAssignedUri = store.findObject(subject, ns.example('assignedUri'));
      const statementLabels = store.findObjects(subject, ns.rdfs('label'));
      const statementDefinitions = store.findObjects(
        subject,
        ns.rdfs('comment')
      );
      const statementUsageNotes = store.findObjects(
        subject,
        ns.vann('usageNote')
      );
      const statementConceptScheme = store.findObject(
        subject,
        ns.example('usesConceptScheme')
      );

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
        ...(statementAssignedUri && {
          assignedUri: statementAssignedUri.value,
        }),
        ...(statementLabels.length > 0 && {
          label: statementLabels.map((x) => ({
            '@language': (<RDF.Literal>x).language,
            '@value': x.value,
          })),
        }),
        ...(statementDefinitions.length > 0 && {
          definition: statementDefinitions.map((x) => ({
            '@language': (<RDF.Literal>x).language,
            '@value': x.value,
          })),
        }),
        ...(statementUsageNotes.length > 0 && {
          usageNote: statementUsageNotes.map((x) => ({
            '@language': (<RDF.Literal>x).language,
            '@value': x.value,
          })),
        }),
        ...(statementConceptScheme && {
          usesConceptScheme: statementConceptScheme.value,
        }),
      };
    });
  }
}
