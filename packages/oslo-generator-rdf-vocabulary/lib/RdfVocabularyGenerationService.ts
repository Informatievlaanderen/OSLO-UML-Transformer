import { createWriteStream } from 'fs';
import type { IGenerationService } from '@oslo-flanders/core';
import {
  getAssignedUri,
  getDefinition,
  getDomain,
  getParentOfProperty,
  getParentsOfClass,
  getRange,
  getTargetStatementId,
  getUsageNote,
  ns,
  createN3Store,
  Logger,
  ServiceIdentifier,
} from '@oslo-flanders/core';

import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import type * as N3 from 'n3';
import { DataFactory } from 'rdf-data-factory';
import rdfSerializer from 'rdf-serialize';
import streamifyArray from 'streamify-array';
import { RdfVocabularyGenerationServiceConfiguration } from './config/RdfVocabularyGenerationServiceConfiguration';

@injectable()
export class RdfVocabularyGenerationService implements IGenerationService {
  public readonly logger: Logger;
  public readonly configuration: RdfVocabularyGenerationServiceConfiguration;
  public readonly dataFactory = new DataFactory();

  public constructor(
  @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration) config: RdfVocabularyGenerationServiceConfiguration,
  ) {
    this.logger = logger;
    this.configuration = config;
  }

  public async run(): Promise<void> {
    const store = await createN3Store(this.configuration.input);

    const packageWellKnownId = store.getSubjects(ns.rdf('type'), ns.example('Package'), null).shift();
    if (!packageWellKnownId) {
      throw new Error(`No package was defined in the OSLO RDF file.`);
    }

    const vocabularyUri = getAssignedUri(packageWellKnownId, store);
    if (!vocabularyUri) {
      throw new Error(`Unable to find the vocabulary URI.`);
    }

    const [vocabularyInfoQuads, classQuads, propertyQuads] = await Promise.all([
      this.createVocabularyInformationQuads(store, <RDF.NamedNode>vocabularyUri),
      this.extractClassQuads(store, <RDF.NamedNode>vocabularyUri),
      this.createAttributeQuads(store, <RDF.NamedNode>vocabularyUri),
    ]);

    const quadStream = streamifyArray([...vocabularyInfoQuads, ...classQuads, ...propertyQuads]);
    const textStream = rdfSerializer.serialize(quadStream, { contentType: this.configuration.contentType });

    const outputStream = createWriteStream(this.configuration.output);
    textStream.pipe(outputStream);
  }

  private async createVocabularyInformationQuads(store: N3.Store, vocabularyUri: RDF.NamedNode): Promise<RDF.Quad[]> {
    const quads: RDF.Quad[] = [];
    quads.push(
      this.dataFactory.quad(
        vocabularyUri,
        ns.rdf('type'),
        ns.owl('Ontology'),
      ),
    );

    return quads;
  }

  private async extractClassQuads(store: N3.Store, vocabularyUri: RDF.NamedNode): Promise<RDF.Quad[]> {
    const quads: RDF.Quad[] = [];
    const classSubjects = store
      .getSubjects(ns.rdf('type'), ns.owl('Class'), null)
      .filter(x => this.isInScope(<RDF.NamedNode>x, store));

    classSubjects.forEach(subject => {
      const assignedUri = getAssignedUri(subject, store);

      if (!assignedUri) {
        this.logger.error(`Unable to find the assignedUri for class ${subject.value}.`);
        return;
      }

      quads.push(
        this.dataFactory.quad(
          <RDF.NamedNode>assignedUri,
          ns.rdf('type'),
          ns.owl('Class'),
        ),
        this.dataFactory.quad(
          <RDF.NamedNode>assignedUri,
          ns.rdfs('isDefinedBy'),
          vocabularyUri,
        ),
      );

      const definition = getDefinition(subject, store, this.configuration.language);
      if (!definition) {
        this.logger.error(`Unable to find the definition for class ${subject.value}.`);
      } else {
        quads.push(
          this.dataFactory.quad(
            <RDF.NamedNode>assignedUri,
            ns.rdfs('comment'),
            definition,
          ),
        );
      }

      const parents = getParentsOfClass(subject, store);
      parents.forEach(parent => {
        const parentAssignedUri = getAssignedUri(parent, store);

        if (!parentAssignedUri) {
          throw new Error(`Unable to find the assigned URI for parent ${parent.value} of class ${subject.value}.`);
        }

        quads.push(
          this.dataFactory.quad(
            <RDF.NamedNode>assignedUri,
            ns.rdfs('subClassOf'),
            <RDF.NamedNode>parentAssignedUri,
          ),
        );
      });

      const usageNote = getUsageNote(subject, store, this.configuration.language);
      if (usageNote) {
        quads.push(
          this.dataFactory.quad(
            <RDF.NamedNode>assignedUri,
            ns.vann('usageNote'),
            usageNote,
          ),
        );
      }
    });
    return quads;
  }

  private async createAttributeQuads(store: N3.Store, vocabularyUri: RDF.NamedNode): Promise<RDF.Quad[]> {
    const quads: RDF.Quad[] = [];

    const datatypePropertyQuads = store
      .getQuads(null, ns.rdf('type'), ns.owl('DatatypeProperty'), null)
      .filter(x => this.isInScope(<RDF.NamedNode>x.subject, store));

    const objectPropertyQuads = store
      .getQuads(null, ns.rdf('type'), ns.owl('ObjectProperty'), null)
      .filter(x => this.isInScope(<RDF.NamedNode>x.subject, store));

    [...datatypePropertyQuads, ...objectPropertyQuads].forEach(propertyQuad => {
      const assignedUri = getAssignedUri(propertyQuad.subject, store);
      if (!assignedUri) {
        this.logger.error(`Unable to find the assignedUri for property ${propertyQuad.subject.value}.`);
        return;
      }

      quads.push(
        this.dataFactory.quad(
          <RDF.NamedNode>assignedUri,
          ns.rdf('type'),
          propertyQuad.object,
        ),
        this.dataFactory.quad(
          <RDF.NamedNode>assignedUri,
          ns.rdfs('isDefinedBy'),
          vocabularyUri,
        ),
      );

      const domainWellKnownId = getDomain(propertyQuad.subject, store);
      if (!domainWellKnownId) {
        this.logger.error(`Unable to find the domain well known id for property ${propertyQuad.subject.value}.`);
        return;
      }

      const domainAssignedUri = getAssignedUri(domainWellKnownId, store);
      if (!domainAssignedUri) {
        this.logger.error(`Unable to find the assigned URI for the domain of property ${propertyQuad.subject.value}.`);
      } else {
        quads.push(
          this.dataFactory.quad(
            <RDF.NamedNode>assignedUri,
            ns.rdfs('domain'),
            <RDF.NamedNode>domainAssignedUri,
          ),
        );
      }

      const rangeWellKnownId = getRange(propertyQuad.subject, store);
      if (!rangeWellKnownId) {
        this.logger.error(`Unable to find the range well known id for property ${propertyQuad.subject.value}.`);
        return;
      }

      let rangeAssignedUri = getAssignedUri(rangeWellKnownId, store);
      if (!rangeAssignedUri) {
        const targetId = getTargetStatementId(
          propertyQuad.subject,
          ns.rdfs('range'),
          rangeWellKnownId,
          store,
        );

        if (targetId) {
          rangeAssignedUri = getAssignedUri(targetId, store);
        }
      }

      if (!rangeAssignedUri) {
        this.logger.error(`Unable to find assigned URI for range of property ${propertyQuad.subject.value}.`);
      } else {
        quads.push(
          this.dataFactory.quad(
            <RDF.NamedNode>assignedUri,
            ns.rdfs('range'),
            <RDF.NamedNode>rangeAssignedUri,
          ),
        );
      }

      const parent = getParentOfProperty(propertyQuad.subject, store);
      if (parent) {
        quads.push(
          this.dataFactory.quad(
            <RDF.NamedNode>assignedUri,
            ns.rdfs('subPropertyOf'),
            <RDF.NamedNode>parent,
          ),
        );
      }

      const definition = getDefinition(propertyQuad.subject, store, this.configuration.language);
      if (!definition) {
        this.logger.error(`Unable to find the definition for property ${propertyQuad.subject.value}.`);
      } else {
        quads.push(
          this.dataFactory.quad(
            <RDF.NamedNode>assignedUri,
            ns.rdfs('comment'),
            definition,
          ),
        );
      }

      const usageNote = getUsageNote(propertyQuad.subject, store, this.configuration.language);
      if (usageNote) {
        quads.push(
          this.dataFactory.quad(
            <RDF.NamedNode>assignedUri,
            ns.vann('usageNote'),
            usageNote,
          ),
        );
      }
    });

    return quads;
  }

  private isInScope(subject: RDF.NamedNode, store: N3.Store): boolean {
    const scope = store.getObjects(subject, ns.example('scope'), null).shift();
    if (!scope) {
      return false;
    }

    return scope.value === 'https://data.vlaanderen.be/id/concept/scope/InPackage';
  }
}
