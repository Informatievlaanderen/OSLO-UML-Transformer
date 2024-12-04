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
    const versionIdQuad: RDF.Quad | undefined = store.findQuad(
      null,
      ns.prov('generatedAtTime'),
      null,
    );

    if (!versionIdQuad) {
      throw new Error(`Unnable to find version id for the document.`);
    }

    document['@id'] = versionIdQuad.subject.value;
    document.generatedAtTime = versionIdQuad.object.value;
  }

  private async getPackages(store: QuadStore): Promise<any> {
    const packageIds: RDF.Term[] = store.findSubjects(
      ns.rdf('type'),
      ns.oslo('Package'),
    );
    return packageIds.map((id) => {
      const packageQuads: RDF.Quad[] = store.findQuads(id, null, null);

      const baseURIValue: RDF.Quad | undefined = packageQuads.find((x) =>
        x.predicate.equals(ns.oslo('baseURI')),
      );
      if (!baseURIValue) {
        throw new Error(
          `Unable to find base URI for package with internal id ${id.value}`,
        );
      }

      const assignedURI: RDF.Quad | undefined = packageQuads.find((x) =>
        x.predicate.equals(ns.oslo('assignedURI')),
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
    const df = new DataFactory();
    // Process only classes in the default graph, so not the referenced classes
    const classIds: RDF.Term[] = store.findSubjects(
      ns.rdf('type'),
      ns.owl('Class'),
      df.defaultGraph(),
    );

    return classIds.reduce<any[]>((jsonLdClasses, subject) => {
      const assignedURI = store.getAssignedUri(subject);

      if (!assignedURI) {
        return jsonLdClasses;
      }

      const definitionQuads: RDF.Quad[] = store.getDefinitions(subject);
      const labelQuads: RDF.Quad[] = store.getLabels(subject);
      const scopeQuad: RDF.NamedNode | undefined = store.getScope(subject);
      const parentQuads: RDF.NamedNode[] = store.getParentsOfClass(subject);
      const codelist: RDF.NamedNode | undefined = store.getCodelist(subject);
      const statuses: RDF.NamedNode | undefined = store.getStatus(subject);
      const other: RDF.Quad[] | undefined =
        store.getSanitizedOtherTags(subject);

      const usageNoteQuads: RDF.Quad[] = store.getUsageNotes(subject);

      jsonLdClasses.push({
        '@id': subject.value,
        '@type': 'Class',
        ...(assignedURI && {
          assignedURI: assignedURI.value,
        }),
        ...this.mapLabels(labelQuads),
        ...this.mapDefinitions(definitionQuads),
        ...this.mapUsageNotes(usageNoteQuads),
        ...this.mapOtherTags(other),
        scope: scopeQuad?.value,
        ...(parentQuads.length > 0 && {
          parent: parentQuads.map((x) => ({ '@id': x.value })),
        }),
        ...(codelist && {
          codelist: codelist.value,
        }),
        ...this.mapStatuses(statuses),
      });

      return jsonLdClasses;
    }, []);
  }

  private async getAttributes(store: QuadStore): Promise<any> {
    const dataTypeAttributeIds: RDF.Term[] = store.findSubjects(
      ns.rdf('type'),
      ns.owl('DatatypeProperty'),
    );
    const objectPropertyAttributeIds: RDF.Term[] = store.findSubjects(
      ns.rdf('type'),
      ns.owl('ObjectProperty'),
    );
    const propertyAttributeIds: RDF.Term[] = store.findSubjects(
      ns.rdf('type'),
      ns.rdf('Property'),
    );

    return [
      ...dataTypeAttributeIds,
      ...objectPropertyAttributeIds,
      ...propertyAttributeIds,
    ].map((subject) => {
      const assignedURI: RDF.NamedNode | undefined =
        store.getAssignedUri(subject);
      const definitionQuads: RDF.Quad[] = store.getDefinitions(subject);
      const attributeTypeQuad: RDF.Term | undefined = store.findObject(
        subject,
        ns.rdf('type'),
      );

      const labelQuads: RDF.Quad[] = store.getLabels(subject);
      const usageNoteQuads: RDF.Quad[] = store.getUsageNotes(subject);

      const domainQuad: RDF.NamedNode | undefined = store.getDomain(subject);
      const rangeQuad: RDF.NamedNode | undefined = store.getRange(subject);

      const scopeQuad: RDF.NamedNode | undefined = store.getScope(subject);
      const parentQuad: RDF.NamedNode | undefined =
        store.getParentOfProperty(subject);
      const minCardinalityQuad: RDF.Literal | undefined =
        store.getMinCardinality(subject);
      const maxCardinalityQuad: RDF.Literal | undefined =
        store.getMaxCardinality(subject);
      const codelist: RDF.NamedNode | undefined = store.getCodelist(subject);
      const statuses: RDF.NamedNode | undefined = store.getStatus(subject);
      const other: RDF.Quad[] | undefined =
        store.getSanitizedOtherTags(subject);

      return {
        '@id': subject.value,
        '@type': attributeTypeQuad?.value,
        ...(assignedURI && {
          assignedURI: assignedURI.value,
        }),
        ...this.mapLabels(labelQuads),
        ...this.mapDefinitions(definitionQuads),
        ...this.mapUsageNotes(usageNoteQuads),
        ...this.mapOtherTags(other),
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
        ...this.mapStatuses(statuses),
      };
    });
  }

  private async getDatatypes(store: QuadStore): Promise<any> {
    const datatypeIds: RDF.Term[] = store.findSubjects(
      ns.rdf('type'),
      ns.rdfs('Datatype'),
    );
    return datatypeIds.map((subject) => {
      const assignedURI: RDF.NamedNode | undefined =
        store.getAssignedUri(subject);
      const definitionQuads: RDF.Quad[] = store.getDefinitions(subject);
      const labelQuads: RDF.Quad[] = store.getLabels(subject);
      const usageNoteQuads: RDF.Quad[] = store.getUsageNotes(subject);
      const scopeQuad: RDF.NamedNode | undefined = store.getScope(subject);
      const statuses: RDF.NamedNode | undefined = store.getStatus(subject);
      const other: RDF.Quad[] | undefined =
        store.getSanitizedOtherTags(subject);

      return {
        '@id': subject.value,
        '@type': 'Datatype',
        ...(assignedURI && {
          assignedURI: assignedURI.value,
        }),
        ...this.mapLabels(labelQuads),
        ...this.mapDefinitions(definitionQuads),
        ...this.mapUsageNotes(usageNoteQuads),
        ...this.mapOtherTags(other),
        ...(scopeQuad && {
          scope: scopeQuad.value,
        }),
        ...this.mapStatuses(statuses),
      };
    });
  }

  private async getReferencedEntities(store: QuadStore): Promise<any> {
    const df = new DataFactory();
    const referencedEntitiesGraph: RDF.NamedNode =
      df.namedNode('referencedEntities');

    const quads: RDF.Quad[] = store.findQuads(
      null,
      null,
      null,
      referencedEntitiesGraph,
    );

    const subjects = new Set(quads.map((x) => x.subject));

    const result: any[] = [];
    subjects.forEach((subject) => {
      const assignedURI: RDF.NamedNode | undefined = store.getAssignedUri(
        subject,
        referencedEntitiesGraph,
      );
      const subjectType: RDF.Term | undefined = store.findObject(
        subject,
        ns.rdf('type'),
        referencedEntitiesGraph,
      );
      const definitions: RDF.Quad[] = store.getDefinitions(
        subject,
        referencedEntitiesGraph,
      );
      const labels: RDF.Quad[] = store.getLabels(
        subject,
        referencedEntitiesGraph,
      );
      const usageNotes: RDF.Quad[] = store.getUsageNotes(
        subject,
        referencedEntitiesGraph,
      );
      const other: RDF.Quad[] | undefined =
        store.getSanitizedOtherTags(subject);
      const scope: RDF.NamedNode | undefined = store.getScope(
        subject,
        referencedEntitiesGraph,
      );

      const statuses: RDF.NamedNode | undefined = store.getStatus(
        subject,
        referencedEntitiesGraph,
      );

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
        ...this.mapOtherTags(other),
        ...this.mapStatuses(statuses),
        ...(scope && {
          scope: scope.value,
        }),
      });
    });
    return result;
  }

  private mapLabels(labels: RDF.Quad[]): any {
    const vocLabels: RDF.Quad[] = labels.filter((x) =>
      x.predicate.equals(ns.oslo('vocLabel')),
    );
    const apLabels: RDF.Quad[] = labels.filter((x) =>
      x.predicate.equals(ns.oslo('apLabel')),
    );
    const diagramLabels: RDF.Quad[] = labels.filter((x) =>
      x.predicate.equals(ns.oslo('diagramLabel')),
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
    const vocDefinitions: RDF.Quad[] = definitions.filter((x) =>
      x.predicate.equals(ns.oslo('vocDefinition')),
    );
    const apDefinitions: RDF.Quad[] = definitions.filter((x) =>
      x.predicate.equals(ns.oslo('apDefinition')),
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

  private mapOtherTags(other: RDF.Quad[]): any {
    const result: any = {};

    other.forEach((quad) => {
      result[quad.predicate.value] = this.mapToLiteral(quad);
    });

    return result;
  }

  private mapUsageNotes(usageNotes: RDF.Quad[]): any {
    const vocUsageNotes: RDF.Quad[] = usageNotes.filter((x) =>
      x.predicate.equals(ns.oslo('vocUsageNote')),
    );
    const apUsageNotes: RDF.Quad[] = usageNotes.filter((x) =>
      x.predicate.equals(ns.oslo('apUsageNote')),
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

  private mapStatuses(statuses: RDF.NamedNode | undefined): any {
    return {
      status: statuses?.value,
    };
  }

  private mapToLiteral(quad: RDF.Quad, addLanguage = true): any {
    return {
      ...(addLanguage && {
        '@language': (<RDF.Literal>quad.object).language,
      }),
      '@value': quad.object.value,
    };
  }
}
