import { writeFile } from 'fs/promises';
import { ns, OutputHandler } from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';

export class OsloJsonLdOutputHandler extends OutputHandler {
  public async write(path: string): Promise<void> {
    const [osloPackages, osloClasses, osloAttributes, osloDatatypes] = await Promise.all([
      this.getOsloPackages(),
      this.getOsloClasses(),
      this.getOsloAttributes(),
      this.getOsloDatatypes(),
    ]);

    const document: any = {};
    document['@context'] = this.getContext();

    const documentUrl = this.store.getSubjects(ns.rdf('type'), ns.example('DocumentId'), null)[0];
    document['@id'] = documentUrl.value;
    document.packages = osloPackages;
    document.classes = osloClasses;
    document.attributes = osloAttributes;
    document.datatypes = osloDatatypes;

    // TODO: add stakeholders

    await writeFile(path, JSON.stringify(document, null, 2));
  }

  // Returns an array because a literal can be annotated with multiple languages
  private getObjectLiterals(quads: RDF.Quad[], predicate: RDF.NamedNode): RDF.Literal[] {
    return quads.filter(x => x.predicate.equals(predicate)).map(x => <RDF.Literal>x.object);
  }

  private getObjectLiteral(quads: RDF.Quad[], predicate: RDF.NamedNode): RDF.Term | undefined {
    const literals = this.getObjectLiterals(quads, predicate);

    if (literals.length > 1) {
      this.logger.warn(`Multiple literals discovered when only one was expected for ${quads[0].subject.value}.`);
    }

    return literals.length > 0 ? literals[0] : undefined;
  }

  private getObjectNamedNodes(quads: RDF.Quad[], predicate: RDF.NamedNode): RDF.NamedNode[] {
    return quads.filter(x => x.predicate.equals(predicate)).map(x => <RDF.NamedNode>x.object);
  }

  private getObjectNamedNode(quads: RDF.Quad[], predicate: RDF.NamedNode): RDF.NamedNode | undefined {
    const namedNodes = this.getObjectNamedNodes(quads, predicate);

    if (namedNodes.length > 1) {
      this.logger.warn(`Multiple named nodes discovered when only one was expected for ${quads[0].subject.value}`);
    }

    return namedNodes.length > 0 ? namedNodes[0] : undefined;
  }

  private async getOsloPackages(): Promise<any> {
    const packageWellKnownIdSubjects = this.store.getSubjects(ns.rdf('type'), ns.example('Package'), null);

    return packageWellKnownIdSubjects.map(wellKnownIdSubject => {
      const packageSubject = this.store.getObjects(wellKnownIdSubject, ns.example('guid'), null)[0];
      const quads = this.store.getQuads(wellKnownIdSubject, null, null, null);

      const baseUriObject = this.getObjectNamedNode(quads, ns.example('baseUri'));

      if (!baseUriObject) {
        this.logger.error(`Unnable to find base URI for ${wellKnownIdSubject.value}. Value will be undefined`);
      }

      return {
        '@id': packageSubject.value,
        '@type': 'Package',
        baseUri: baseUriObject?.value,
      };
    });
  }

  private async getOsloClasses(): Promise<any> {
    const classWellKnownIdSubjects = this.store.getSubjects(ns.rdf('type'), ns.owl('Class'), null);

    return classWellKnownIdSubjects.reduce<any[]>((osloClasses, wellKnownIdSubject) => {
      const classSubject = this.store.getObjects(wellKnownIdSubject, ns.example('guid'), null)[0];

      if (classSubject.equals(ns.skos('Concept'))) {
        return osloClasses;
      }

      const quads = this.store.getQuads(wellKnownIdSubject, null, null, null);

      const definitionLiterals = this.getObjectLiterals(quads, ns.rdfs('comment'));
      const labelLiterals = this.getObjectLiterals(quads, ns.rdfs('label'));
      const usageNoteLiterals = this.getObjectLiterals(quads, ns.vann('usageNote'));
      // TODO: when using a codelist for scope, this can not be a literal anymore.
      const scopeLiteral = this.getObjectLiteral(quads, ns.example('scope'));
      const parentObjects = this.getObjectNamedNodes(quads, ns.rdfs('subClassOf'));
      const parentLabelLiterals: { id: string; labels: RDF.Literal[] }[] = [];

      if (parentObjects.length > 0) {
        parentObjects.forEach(x => {
          const labelQuads = this.store.getQuads(
            this.factory.namedNode(x.value),
            ns.rdfs('label'),
            null,
            null,
          );

          parentLabelLiterals.push({
            id: x.value,
            labels: labelQuads.map(y => <RDF.Literal>y.object),
          });
        });
      }

      osloClasses.push({
        '@id': classSubject.value,
        '@type': 'Class',
        guid: wellKnownIdSubject.value,
        label: labelLiterals.map(x => ({ '@language': x.language, '@value': x.value })),
        definition: definitionLiterals.map(x => ({ '@language': x.language, '@value': x.value })),
        ...usageNoteLiterals.length > 0 && {
          usageNote: usageNoteLiterals.map(x => ({ '@language': x.language, '@value': x.value })),
        },
        ...parentObjects.length > 0 && {
          parent: parentLabelLiterals.map(x => (
            {
              '@id': x.id,
              ...x.labels && x.labels.length > 0 && {
                label: x.labels.length > 1 ? x.labels.map(y => y.value) : x.labels[0].value,
              },
            })),
        },
        scope: scopeLiteral?.value,
      });

      return osloClasses;
    }, []);
  }

  private async getOsloAttributes(): Promise<any> {
    const datatypeAttributes = this.store.getSubjects(ns.rdf('type'), ns.owl('DatatypeProperty'), null);
    const objectPropertyAttributes = this.store.getSubjects(ns.rdf('type'), ns.owl('ObjectProperty'), null);
    const propertyAttributes = this.store.getSubjects(ns.rdf('type'), ns.rdf('Property'), null);

    return [
      ...datatypeAttributes,
      ...objectPropertyAttributes,
      ...propertyAttributes,
    ].map(wellKnownIdSubject => {
      const attributeSubject = this.store.getObjects(wellKnownIdSubject, ns.example('guid'), null)[0];
      const quads = this.store.getQuads(wellKnownIdSubject.value, null, null, null);

      // Attributes generated by the normalization of the connectors (associationclasses)
      // do not have a definition
      const definitionLiterals = this.getObjectLiterals(quads, ns.rdfs('comment'));
      const attributeType = this.getObjectNamedNode(quads, ns.rdf('type'));
      const labelLiterals = this.getObjectLiterals(quads, ns.rdfs('label'));
      const usageNoteLiterals = this.getObjectLiterals(quads, ns.vann('usageNote'));
      const domainWellKnownIdNode = this.getObjectNamedNode(quads, ns.rdfs('domain'));

      let domainSubject: RDF.NamedNode | undefined;
      let domainLabelLiterals: RDF.Literal[] | undefined;

      if (domainWellKnownIdNode) {
        // We assume that there is only one subject attached to this well-known id
        domainSubject = <RDF.NamedNode>this.store.getObjects(domainWellKnownIdNode, ns.example('guid'), null)[0];
        const domainLabelQuads = this.store.getQuads(
          domainWellKnownIdNode,
          ns.rdfs('label'),
          null,
          null,
        );

        domainLabelLiterals = domainLabelQuads.map(x => <RDF.Literal>x.object);
      }

      const rangeNamedNode = this.getObjectNamedNode(quads, ns.rdfs('range'));
      let rangeSubject: RDF.Term | undefined;
      let rangeLabelLiterals: RDF.Literal[] | undefined;
      let rangeCodelist: RDF.NamedNode | undefined;

      // When range is a codelist (skos:Concept), its definition
      // and usage note is included in the attribute object
      let rangeDefinitionLiterals: RDF.Literal[] | undefined;
      let rangeUsageNoteLiterals: RDF.Literal[] | undefined;

      if (rangeNamedNode) {
        if (rangeNamedNode.value.startsWith(ns.example('.well-known').value)) {
          rangeSubject = <RDF.NamedNode>this.store.getObjects(rangeNamedNode, ns.example('guid'), null)[0];
        } else {
          rangeSubject = rangeNamedNode;
        }

        const rangeQuads = this.store.getQuads(rangeNamedNode, null, null, null);
        rangeLabelLiterals = rangeQuads
          .filter(x => x.predicate.equals(ns.rdfs('label')))
          .map(x => <RDF.Literal>x.object);

        // When range is a skos:Concept, we add all the information
        // we have for this skos:Concept to the range
        if (rangeSubject.equals(ns.skos('Concept'))) {
          rangeDefinitionLiterals = rangeQuads
            .filter(x => x.predicate.equals(ns.rdfs('comment')))
            .map(x => <RDF.Literal>x.object);

          rangeUsageNoteLiterals = rangeQuads
            .filter(x => x.predicate.equals(ns.vann('usageNote')))
            .map(x => <RDF.Literal>x.object);

          rangeCodelist = this.getObjectNamedNode(rangeQuads, ns.example('codelist'));
        }
      }

      const maxCardinalityLiteral = this.getObjectLiteral(quads, ns.shacl('maxCount'));
      const minCardinalityLiteral = this.getObjectLiteral(quads, ns.shacl('minCount'));
      // TODO: when using codelists, this will not by a literal anymore
      const scopeLiteral = this.getObjectLiteral(quads, ns.example('scope'));
      const parentLiteral = this.getObjectNamedNode(quads, ns.rdfs('subPropertyOf'));

      return {
        '@id': attributeSubject.value,
        '@type': attributeType?.value,
        guid: wellKnownIdSubject.value,
        label: labelLiterals.map(x => ({ '@language': x.language, '@value': x.value })),
        ...definitionLiterals && {
          definition: definitionLiterals.map(x => ({ '@language': x.language, '@value': x.value })),
        },
        ...usageNoteLiterals && {
          usageNote: usageNoteLiterals.map(x => ({ '@language': x.language, '@value': x.value })),
        },
        domain: {
          '@id': domainSubject?.value,
          '@type': 'Class',
          ...domainLabelLiterals && {
            label: domainLabelLiterals.map(x => ({ '@language': x.language, '@value': x.value })),
          },
        },
        range: {
          '@id': rangeSubject?.value,
          ...(rangeLabelLiterals && rangeLabelLiterals.length > 0) && {
            label: rangeLabelLiterals.length > 1 ?
              rangeLabelLiterals.map(x => ({ '@language': x.language, '@value': x.value })) :
              rangeLabelLiterals[0].value,
          },
          ...(rangeDefinitionLiterals && rangeDefinitionLiterals.length > 0) && {
            definition: rangeDefinitionLiterals.length > 1 ?
              rangeDefinitionLiterals.map(x => ({ '@language': x.language, '@value': x.value })) :
              rangeDefinitionLiterals[0].value,
          },
          ...(rangeUsageNoteLiterals && rangeUsageNoteLiterals.length > 0) && {
            usageNote: rangeUsageNoteLiterals.length > 1 ?
              rangeUsageNoteLiterals.map(x => ({ '@language': x.language, '@value': x.value })) :
              rangeUsageNoteLiterals[0].value,
          },
          ...rangeCodelist && {
            codelist: rangeCodelist.value,
          },
        },
        ...parentLiteral && {
          parent: parentLiteral.value,
        },
        minCount: minCardinalityLiteral?.value,
        maxCount: maxCardinalityLiteral?.value,
        scope: scopeLiteral?.value,
      };
    });
  }

  private async getOsloDatatypes(): Promise<any> {
    const datatypesWellKnowIdSubjects = this.store.getSubjects(ns.rdf('type'), ns.example('DataType'), null);

    return datatypesWellKnowIdSubjects.map(wellKnownIdSubject => {
      const datatypeSubject = this.store.getObjects(wellKnownIdSubject, ns.example('guid'), null)[0];
      const quads = this.store.getQuads(wellKnownIdSubject, null, null, null);

      const definitionLiterals = this.getObjectLiterals(quads, ns.rdfs('comment'));
      const labelLiterals = this.getObjectLiterals(quads, ns.rdfs('label'));
      const usageNoteLiterals = this.getObjectLiterals(quads, ns.vann('usageNote'));
      // TODO: when using a codelist for scope, this can not be a literal anymore.
      const scopeLiteral = this.getObjectLiteral(quads, ns.example('scope'));

      return {
        '@id': datatypeSubject.value,
        '@type': 'DataType',
        guid: wellKnownIdSubject.value,
        label: labelLiterals.map(x => ({ '@language': x.language, '@value': x.value })),
        definition: definitionLiterals.map(x => ({ '@language': x.language, '@value': x.value })),
        usageNote: usageNoteLiterals.map(x => ({ '@language': x.language, '@value': x.value })),
        scope: scopeLiteral?.value,
      };
    });
  }

  private getContext(): any {
    return {
      vlaanderen: 'http://data.vlaanderen.be/ns/',
      owl: 'http://www.w3.org/2002/07/owl#',
      void: 'http://rdfs.org/ns/void#',
      dcterms: 'http://purl.org/dc/terms/',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      dcat: 'http://www.w3.org/ns/dcat#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      qb: 'http://purl.org/linked-data/cube#',
      skos: 'http://www.w3.org/2004/02/skos/core#',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      foaf: 'http://xmlns.com/foaf/0.1/',
      person: 'http://www.w3.org/ns/person#',
      rec: 'http://www.w3.org/2001/02pd/rec54#',
      vann: 'http://purl.org/vocab/vann/',
      sh: 'http://w3.org/ns/shacl#',
      authors: {
        '@type': 'foaf:Person',
        '@id': 'foaf:maker',
      },
      editors: {
        '@type': 'foaf:Person',
        '@id': 'rec:editor',
      },
      contributors: {
        '@type': 'foaf:Person',
        '@id': 'dcterms:contributor',
      },
      affiliation: {
        '@id': 'http://schema.org/affiliation',
      },
      classes: 'http://example.org/classes',
      datatypes: 'http://example.org/datatypes',
      attributes: 'http://example.org/attributes',
      label: {
        '@id': 'rdfs:label',
        '@container': '@language',
      },
      definition: {
        '@id': 'rdfs:comment',
        '@container': '@language',
      },
      usageNote: {
        '@id': 'vann:usageNote',
        '@container': '@language',
      },
      domain: {
        '@id': 'rdfs:domain',
      },
      range: {
        '@id': 'rdfs:range',
      },
      minCardinality: {
        '@id': 'sh:minCount',
      },
      maxCardinality: {
        '@id': 'sh:maxCount',
      },
      parent: {
        '@id': 'rdfs:subClassOf',
        '@type': 'owl:Class',
      },
      scope: {
        '@id': 'http://example.org/scope',
      },
      Class: {
        '@id': 'owl:Class',
      },
      DataType: {
        '@id': 'http://example.org/DataType',
      },
      guid: {
        '@id': 'http://example.org/guid',
        '@type': '@id',
      },
    };
  }
}
