import { createWriteStream } from 'fs';
import type { IGenerationService } from '@oslo-flanders/core';
import { ns, createN3Store, Logger, ServiceIdentifier } from '@oslo-flanders/core';

import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import type * as N3 from 'n3';
import { DataFactory } from 'rdf-data-factory';
import rdfSerializer from 'rdf-serialize';
import { RdfVocabularyGenerationServiceConfiguration } from './config/RdfVocabularyGenerationServiceConfiguration';
const streamifyArray = require('streamify-array');

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

    const vocabularyUri = store.getObjects(packageWellKnownId, ns.example('assignedUri'), null).shift();
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
    textStream.pipe(outputStream)
      .on('error', error => console.error(error));
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
      const assignedUri = store.getObjects(subject, ns.example('assignedUri'), null).shift();
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

      const definitions = store.getObjects(subject, ns.rdfs('comment'), null);
      const languageDefinition = definitions.find(x => (<RDF.Literal>x).language === this.configuration.language);

      if (!languageDefinition) {
        this.logger.error(`Unable to find the definition for class ${subject.value}.`);
      } else {
        quads.push(
          this.dataFactory.quad(
            <RDF.NamedNode>assignedUri,
            ns.rdfs('comment'),
            languageDefinition,
          ),
        );
      }

      const parents = store.getObjects(subject, ns.rdfs('subClassOf'), null);
      parents.forEach(parent => {
        const parentAssignedUri = store.getObjects(parent, ns.example('assignedUri'), null).shift();

        if (!parentAssignedUri) {
          throw new Error(`Unable to find the assigned URI for parent ${parent.value} of class ${subject.value}.`);
        }

        quads.push(
          this.dataFactory.quad(
            <RDF.NamedNode>assignedUri,
            ns.rdfs('subClassOf'),
            parentAssignedUri,
          ),
        );
      });

      const usageNote = store.getObjects(subject, ns.vann('usageNote'), null).shift();
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
      const assignedUri = store.getObjects(propertyQuad.subject, ns.example('assignedUri'), null).shift();
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

      const domainWellKnownId = store.getObjects(propertyQuad.subject, ns.rdfs('domain'), null).shift();
      if (!domainWellKnownId) {
        this.logger.error(`Unable to find the domain well known id for property ${propertyQuad.subject.value}.`);
        return;
      }

      const domainAssignedUri = store.getObjects(domainWellKnownId, ns.example('assignedUri'), null).shift();
      if (!domainAssignedUri) {
        this.logger.error(`Unable to find the assigned URI for the domain of property ${propertyQuad.subject.value}.`);
      } else {
        quads.push(
          this.dataFactory.quad(
            <RDF.NamedNode>assignedUri,
            ns.rdfs('domain'),
            domainAssignedUri,
          ),
        );
      }

      const rangeWellKnownId = store.getObjects(propertyQuad.subject, ns.rdfs('range'), null).shift();
      if (!rangeWellKnownId) {
        this.logger.error(`Unable to find the range well known id for property ${propertyQuad.subject.value}.`);
        return;
      }

      let rangeAssignedUri = store.getObjects(rangeWellKnownId, ns.example('assignedUri'), null).shift();
      if (!rangeAssignedUri) {
        const statementIds = store.getSubjects(ns.rdf('type'), ns.rdf('Statement'), null);
        const statementSubjectPredicateSubjects = store.getSubjects(ns.rdf('subject'), propertyQuad.subject, null);
        const statementPredicatePredicateSubjects = store.getSubjects(ns.rdf('predicate'), ns.rdfs('range'), null);
        const statementObjectPredicateSubjects = store.getSubjects(ns.rdf('object'), rangeWellKnownId, null);

        const targetIds = statementIds
          .filter(x => statementSubjectPredicateSubjects.includes(x))
          .filter(x => statementPredicatePredicateSubjects.includes(x))
          .filter(x => statementObjectPredicateSubjects.includes(x));

        if (targetIds.length > 1) {
          throw new Error(`Multiple target IDs found in statement for range info of property ${propertyQuad.subject.value}.`);
        }

        const targetId = targetIds.shift();

        if (targetId) {
          rangeAssignedUri = store.getObjects(targetId, ns.example('assignedUri'), null).shift();
        }
      }

      if (!rangeAssignedUri) {
        this.logger.error(`Unable to find assigned URI for range of property ${propertyQuad.subject.value}.`);
      } else {
        quads.push(
          this.dataFactory.quad(
            <RDF.NamedNode>assignedUri,
            ns.rdfs('range'),
            rangeAssignedUri,
          ),
        );
      }

      const parent = store.getObjects(propertyQuad.subject, ns.rdfs('subPropertyOf'), null).shift();
      if (parent) {
        quads.push(
          this.dataFactory.quad(
            <RDF.NamedNode>assignedUri,
            ns.rdfs('subPropertyOf'),
            parent,
          ),
        );
      }

      const definitions = store.getObjects(propertyQuad.subject, ns.rdfs('comment'), null);
      const languageDefinition = definitions.find(x => (<RDF.Literal>x).language === this.configuration.language);

      if (!languageDefinition) {
        this.logger.error(`Unable to find the definition for property ${propertyQuad.subject.value}.`);
      } else {
        quads.push(
          this.dataFactory.quad(
            <RDF.NamedNode>assignedUri,
            ns.rdfs('comment'),
            languageDefinition,
          ),
        );
      }

      const usageNote = store.getObjects(propertyQuad.subject, ns.vann('usageNote'), null).shift();
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
