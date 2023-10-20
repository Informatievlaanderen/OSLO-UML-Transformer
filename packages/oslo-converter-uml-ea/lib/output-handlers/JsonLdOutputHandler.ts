import type { WriteStream } from 'fs';
import type { IOutputHandler, QuadStore } from '@oslo-flanders/core';
import { ns } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { getOsloContext } from '../utils/osloContext';

export class JsonLdOutputHandler implements IOutputHandler {
  public async write(store: QuadStore, writeStream: any): Promise<void> {
    const [packages, classes, attributes, dataTypes, referencedEntities] =
      await Promise.all([
        this.getPackages(store),
        this.getClasses(store),
        this.getAttributes(store),
        this.getDatatypes(store),
        this.getReferencedEntities(store),
      ]);

    const document: any = {};
    document['@context'] = getOsloContext();
    this.addDocumentInformation(document, store);

    document.packages = packages;
    document.classes = classes;
    document.attributes = attributes;
    document.datatypes = dataTypes;
    document.referencedEntities = referencedEntities;

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
    const packageIds = store.findSubjects(ns.rdf('type'), ns.oslo('Package'));
    return packageIds.map((id) => {
      const packageQuads = store.findQuads(id, null, null);

      const baseURIValue = packageQuads.find((x) =>
        x.predicate.equals(ns.oslo('baseURI'))
      );
      if (!baseURIValue) {
        throw new Error(
          `Unable to find base URI for package with internal id ${id.value}`
        );
      }

      const assignedURI = packageQuads.find((x) =>
        x.predicate.equals(ns.oslo('assignedURI'))
      );
      return {
        '@id': id.value,
        '@type': 'Package',
        ...(assignedURI && {
          assignedURI: assignedURI.object.value,
        }),
        baseURI: baseURIValue.object.value,
      };
    });
  }

  private async getClasses(store: QuadStore): Promise<any> {
    const classIds = store.findSubjects(ns.rdf('type'), ns.owl('Class'));

    return classIds.reduce<any[]>((jsonLdClasses, subject) => {
      const assignedURI = store.getAssignedUri(subject);

      if (!assignedURI) {
        return jsonLdClasses;
      }

      const definitionQuads = store.getDefinitions(subject);
      const labelQuads = store.getLabels(subject);
      const scopeQuad = store.getScope(subject);
      const parentQuads = store.getParentsOfClass(subject);
      const codelist = store.getCodelist(subject);
      const usageNoteQuads = store.getUsageNotes(subject);

      jsonLdClasses.push({
        '@id': subject.value,
        '@type': 'Class',
        ...(assignedURI && {
          assignedURI: assignedURI.value,
        }),
        ...this.mapLabels(labelQuads),
        ...this.mapDefinitions(definitionQuads),
        ...this.mapUsageNotes(usageNoteQuads),
        scope: scopeQuad?.value,
        ...(parentQuads.length > 0 && {
          parent: parentQuads.map((x) => ({ '@id': x.value })),
        }),
        ...(codelist && {
          codelist: codelist.value,
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
      const assignedURI = store.getAssignedUri(subject);
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
      const codelist = store.getCodelist(subject);

      return {
        '@id': subject.value,
        '@type': attributeTypeQuad?.value,
        ...(assignedURI && {
          assignedURI: assignedURI.value,
        }),
        ...this.mapLabels(labelQuads),
        ...this.mapDefinitions(definitionQuads),
        ...this.mapUsageNotes(usageNoteQuads),
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
        ...(codelist && {
          codelist: codelist.value,
        }),
      };
    });
  }

  private async getDatatypes(store: QuadStore): Promise<any> {
    const datatypeIds = store.findSubjects(ns.rdf('type'), ns.rdfs('Datatype'));
    return datatypeIds.map((subject) => {
      const assignedURI = store.getAssignedUri(subject);
      const definitionQuads = store.getDefinitions(subject);
      const labelQuads = store.getLabels(subject);
      const usageNoteQuads = store.getUsageNotes(subject);
      const scopeQuad = store.getScope(subject);

      return {
        '@id': subject.value,
        '@type': 'Datatype',
        ...(assignedURI && {
          assignedURI: assignedURI.value,
        }),
        ...this.mapLabels(labelQuads),
        ...this.mapDefinitions(definitionQuads),
        ...this.mapUsageNotes(usageNoteQuads),
        ...(scopeQuad && {
          scope: scopeQuad.value,
        }),
      };
    });
  }

  private async getReferencedEntities(store: QuadStore): Promise<any> {
    const df = new DataFactory();
    const referencedEntitiesGraph = df.namedNode('referencedEntities');

    const quads: RDF.Quad[] = store.findQuads(
      null,
      null,
      null,
      referencedEntitiesGraph
    );

    const subjects = new Set(quads.map((x) => x.subject));

    const result: any[] = [];
    subjects.forEach((subject) => {
      const assignedURI = store.getAssignedUri(
        subject,
        referencedEntitiesGraph
      );
      const subjectType = store.findObject(
        subject,
        ns.rdf('type'),
        referencedEntitiesGraph
      );
      const definitions = store.getDefinitions(
        subject,
        referencedEntitiesGraph
      );
      const labels = store.getLabels(subject, referencedEntitiesGraph);
      const usageNotes = store.getUsageNotes(subject, referencedEntitiesGraph);
      const scope = store.getScope(subject, referencedEntitiesGraph);

      result.push({
        '@id': subject.value,
        ...(subjectType && {
          '@type': subjectType.value,
        }),
        ...(assignedURI && {
          assignedURI: assignedURI.value,
        }),
        ...this.mapLabels(labels),
        ...this.mapDefinitions(definitions),
        ...this.mapUsageNotes(usageNotes),
        ...(scope && {
          scope: scope.value,
        }),
      });
    });
    return result;
  }

  private mapLabels(labels: RDF.Quad[]): any {
    const vocLabels = labels.filter((x) =>
      x.predicate.equals(ns.oslo('vocLabel'))
    );
    const apLabels = labels.filter((x) =>
      x.predicate.equals(ns.oslo('apLabel'))
    );
    const diagramLabels = labels.filter((x) =>
      x.predicate.equals(ns.oslo('diagramLabel'))
    );

    return {
      ...(vocLabels.length > 0 && {
        vocLabel: vocLabels.map((x) => this.mapToLiteral(x)),
      }),
      ...(apLabels.length > 0 && {
        apLabel: apLabels.map((x) => this.mapToLiteral(x)),
      }),
      ...(diagramLabels.length > 0 && {
        diagramLabel: diagramLabels.map((x) => this.mapToLiteral(x, false)),
      }),
    };
  }

  private mapDefinitions(definitions: RDF.Quad[]): any {
    const vocDefinitions = definitions.filter((x) =>
      x.predicate.equals(ns.oslo('vocDefinition'))
    );
    const apDefinitions = definitions.filter((x) =>
      x.predicate.equals(ns.oslo('apDefinition'))
    );

    return {
      ...(vocDefinitions.length > 0 && {
        vocDefinition: vocDefinitions.map((x) => this.mapToLiteral(x)),
      }),
      ...(apDefinitions.length > 0 && {
        apDefinition: apDefinitions.map((x) => this.mapToLiteral(x)),
      }),
    };
  }

  private mapUsageNotes(usageNotes: RDF.Quad[]): any {
    const vocUsageNotes = usageNotes.filter((x) =>
      x.predicate.equals(ns.oslo('vocUsageNote'))
    );
    const apUsageNotes = usageNotes.filter((x) =>
      x.predicate.equals(ns.oslo('apUsageNote'))
    );

    return {
      ...(vocUsageNotes.length > 0 && {
        vocUsageNote: vocUsageNotes.map((x) => this.mapToLiteral(x)),
      }),
      ...(apUsageNotes.length > 0 && {
        apUsageNote: apUsageNotes.map((x) => this.mapToLiteral(x)),
      }),
    };
  }

  private mapToLiteral(quad: RDF.Quad, addLanguage: boolean = true): any {
    return {
      ...(addLanguage && {
        '@language': (<RDF.Literal>quad.object).language,
      }),
      '@value': quad.object.value,
    };
  }
}
