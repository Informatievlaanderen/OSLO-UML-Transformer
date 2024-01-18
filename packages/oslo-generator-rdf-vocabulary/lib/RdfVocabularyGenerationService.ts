/* eslint-disable eslint-comments/disable-enable-pair */
 
import { createWriteStream } from 'fs';
import type { IService } from '@oslo-flanders/core';
import {
  QuadStore,
  ns,
  Logger,
  ServiceIdentifier,
} from '@oslo-flanders/core';

import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import { DataFactory } from 'rdf-data-factory';
import rdfSerializer from 'rdf-serialize';
import streamifyArray from 'streamify-array';
import {
  RdfVocabularyGenerationServiceConfiguration,
} from '@oslo-generator-rdf-vocabulary/config/RdfVocabularyGenerationServiceConfiguration';

@injectable()
export class RdfVocabularyGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: RdfVocabularyGenerationServiceConfiguration;
  public readonly dataFactory = new DataFactory();
  public readonly store: QuadStore;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration) config: RdfVocabularyGenerationServiceConfiguration,
    @inject(ServiceIdentifier.QuadStore) store: QuadStore,
  ) {
    this.logger = logger;
    this.configuration = config;
    this.store = store;
  }

  public async init(): Promise<void> {
    return this.store.addQuadsFromFile(this.configuration.input);
  }

  public async run(): Promise<void> {
    const packageWellKnownId = this.store.getPackageId();
    if (!packageWellKnownId) {
      throw new Error(`No package was defined in the OSLO RDF file.`);
    }

    const vocabularyUri = this.store.getAssignedUri(packageWellKnownId);
    if (!vocabularyUri) {
      throw new Error(`Unable to find the vocabulary URI.`);
    }

    const [vocabularyInfoQuads, classQuads, propertyQuads] = await Promise.all([
      this.createVocabularyInformationQuads(vocabularyUri),
      this.extractClassQuads(vocabularyUri),
      this.createAttributeQuads(vocabularyUri),
    ]);

    const quadStream = streamifyArray([...vocabularyInfoQuads, ...classQuads, ...propertyQuads]);
    const textStream = rdfSerializer.serialize(quadStream, { contentType: this.configuration.contentType });

    const outputStream = createWriteStream(this.configuration.output);
    textStream.pipe(outputStream);
  }

  private async createVocabularyInformationQuads(vocabularyUri: RDF.NamedNode): Promise<RDF.Quad[]> {
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

  private async extractClassQuads(vocabularyUri: RDF.NamedNode): Promise<RDF.Quad[]> {
    const quads: RDF.Quad[] = [];
    const classSubjects = this.store.getClassIds()
      .filter(x => this.isInScope(x));

    classSubjects.forEach(subject => {
      const assignedUri = this.store.getAssignedUri(subject);

      if (!assignedUri) {
        this.logger.error(`Unable to find the assignedUri for class ${subject.value}.`);
        return;
      }

      quads.push(
        this.dataFactory.quad(
          assignedUri,
          ns.rdf('type'),
          ns.owl('Class'),
        ),
        this.dataFactory.quad(
          assignedUri,
          ns.rdfs('isDefinedBy'),
          vocabularyUri,
        ),
      );

      const definition = this.store.getDefinition(subject, this.configuration.language);
      if (!definition) {
        this.logger.error(`Unable to find the definition for class ${subject.value}.`);
      } else {
        quads.push(
          this.dataFactory.quad(
            assignedUri,
            ns.rdfs('comment'),
            definition,
          ),
        );
      }

      const parents = this.store.getParentsOfClass(subject);
      parents.forEach(parent => {
        const parentAssignedUri =
          this.store.getAssignedUri(parent) ||
          this.store.getAssignedUriViaStatements(
            subject,
            ns.rdfs('subClassOf'),
            parent,
          );

        if (!parentAssignedUri) {
          throw new Error(`Unable to find the assigned URI for parent ${parent.value} of class ${subject.value}.`);
        }

        quads.push(
          this.dataFactory.quad(
            assignedUri,
            ns.rdfs('subClassOf'),
            parentAssignedUri,
          ),
        );
      });

      const usageNote = this.store.getUsageNote(subject, this.configuration.language);
      if (usageNote) {
        quads.push(
          this.dataFactory.quad(
            assignedUri,
            ns.vann('usageNote'),
            usageNote,
          ),
        );
      }
    });
    return quads;
  }

  private async createAttributeQuads(vocabularyUri: RDF.NamedNode): Promise<RDF.Quad[]> {
    const quads: RDF.Quad[] = [];

    const datatypePropertyIds = this.store.getDatatypePropertyIds()
      .filter(x => this.isInScope(x));

    const objectPropertyIds = this.store.getObjectPropertyIds()
      .filter(x => this.isInScope(x));

    [...datatypePropertyIds, ...objectPropertyIds].forEach(id => {
      const assignedUri = this.store.getAssignedUri(id);
      if (!assignedUri) {
        this.logger.error(`Unable to find the assignedUri for property ${id.value}.`);
        return;
      }

      const subjectType = <RDF.NamedNode>this.store.findObject(id, ns.rdf('type'))!;

      quads.push(
        this.dataFactory.quad(
          assignedUri,
          ns.rdf('type'),
          subjectType,
        ),
        this.dataFactory.quad(
          assignedUri,
          ns.rdfs('isDefinedBy'),
          vocabularyUri,
        ),
      );

      const domainWellKnownId = this.store.getDomain(id);
      if (!domainWellKnownId) {
        this.logger.error(`Unable to find the domain well known id for property ${id.value}.`);
        return;
      }

      const domainAssignedUri = this.store.getAssignedUri(domainWellKnownId);
      if (!domainAssignedUri) {
        this.logger.error(`Unable to find the assigned URI for the domain of property ${id.value}.`);
      } else {
        quads.push(
          this.dataFactory.quad(
            assignedUri,
            ns.rdfs('domain'),
            domainAssignedUri,
          ),
        );
      }

      const rangeWellKnownId = this.store.getRange(id);
      if (!rangeWellKnownId) {
        this.logger.error(`Unable to find the range well known id for property ${id.value}.`);
        return;
      }

      let rangeAssignedUri = this.store.getAssignedUri(rangeWellKnownId);
      if (!rangeAssignedUri) {
        const targetId = this.store.getTargetStatementId(
          id,
          ns.rdfs('range'),
          rangeWellKnownId,
        );

        if (targetId) {
          rangeAssignedUri = this.store.getAssignedUri(targetId);
        }
      }

      if (!rangeAssignedUri) {
        this.logger.error(`Unable to find assigned URI for range of property ${id.value}.`);
      } else {
        quads.push(
          this.dataFactory.quad(
            assignedUri,
            ns.rdfs('range'),
            rangeAssignedUri,
          ),
        );
      }

      const parent = this.store.getParentOfProperty(id);
      if (parent) {
        quads.push(
          this.dataFactory.quad(
            assignedUri,
            ns.rdfs('subPropertyOf'),
            parent,
          ),
        );
      }

      const definition = this.store.getDefinition(id, this.configuration.language);
      if (!definition) {
        this.logger.error(`Unable to find the definition for property ${id.value}.`);
      } else {
        quads.push(
          this.dataFactory.quad(
            assignedUri,
            ns.rdfs('comment'),
            definition,
          ),
        );
      }

      const usageNote = this.store.getUsageNote(id, this.configuration.language);
      if (usageNote) {
        quads.push(
          this.dataFactory.quad(
            assignedUri,
            ns.vann('usageNote'),
            usageNote,
          ),
        );
      }
    });

    return quads;
  }

  private isInScope(subject: RDF.NamedNode): boolean {
    const scope = this.store.getScope(subject);
    if (!scope) {
      return false;
    }

    return scope.value === 'https://data.vlaanderen.be/id/concept/scope/InPackage';
  }
}
