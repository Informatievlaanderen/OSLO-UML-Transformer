import {
  getApplicationProfileDefinition,
  getApplicationProfileLabel,
  getApplicationProfileUsageNote,
  ns,
  type QuadStore,
} from '@oslo-flanders/core';
import type * as RDF from '@rdfjs/types';

import type { NamedOrBlankNode } from '../types/IHandler';
import { ShaclHandler } from '../types/IHandler';
import { toPascalCase } from '../utils/utils';
import { inject } from 'inversify';
import { ShaclTemplateGenerationServiceIdentifier } from '../config/ShaclTemplateGenerationServiceIdentifier';
import { Logger } from '@oslo-flanders/core';
import { ShaclTemplateGenerationServiceConfiguration } from '../config/ShaclTemplateGenerationServiceConfiguration';
import { TranslationService } from '../TranslationService';

/**
 * Adds the base information for a property shape.
 */
export class PropertyShapeBaseHandler extends ShaclHandler {
  public constructor(
    @inject(ShaclTemplateGenerationServiceIdentifier.Configuration)
    config: ShaclTemplateGenerationServiceConfiguration,
    @inject(ShaclTemplateGenerationServiceIdentifier.Logger) logger: Logger,
    @inject(ShaclTemplateGenerationServiceIdentifier.TranslationService)
    translationService: TranslationService,
  ) {
    super(config, logger, translationService);
  }

  public handle(
    subject: RDF.NamedNode,
    store: QuadStore,
    shaclStore: QuadStore,
  ): void {
    const assignedURI: RDF.NamedNode | undefined =
      store.getAssignedUri(subject);

    if (!assignedURI) {
      throw new Error(
        `Unable to find the assigned URI for subject "${subject.value}".`,
      );
    }

    const label: RDF.Literal | undefined = getApplicationProfileLabel(
      subject,
      store,
      this.config.language,
    );

    if (!label) {
      throw new Error(
        `Unable to find the label for subject "${subject.value}".`,
      );
    }

    const description: RDF.Literal | undefined =
      getApplicationProfileDefinition(subject, store, this.config.language);

    // https://vlaamseoverheid.atlassian.net/browse/SDTT-363
    // Relax the constraint to a warning
    if (!description) {
      this.logger.warn(
        `Unable to find the description for subject "${subject.value}".`,
      );
    }

    const usageNote: RDF.Literal | undefined = getApplicationProfileUsageNote(
      subject,
      store,
      this.config.language,
    );

    const range: RDF.NamedNode | undefined = store.getRange(subject);

    if (!range) {
      throw new Error(
        `Unable to find the range for subject "${subject.value}".`,
      );
    }

    const rangeAssignedURI: RDF.NamedNode | undefined =
      store.getAssignedUri(range);
    if (!rangeAssignedURI) {
      throw new Error(
        `Unable to find the assigned URI for range "${range.value}".`,
      );
    }

    const propertyType: RDF.NamedNode | undefined = <RDF.NamedNode | undefined>(
      store.findObject(subject, ns.rdf('type'))
    );
    if (!propertyType) {
      throw new Error(
        `Unable to find the type for subject "${subject.value}".`,
      );
    }
    const propertyTypePredicate: RDF.NamedNode = propertyType.equals(
      ns.owl('DatatypeProperty'),
    )
      ? ns.shacl('datatype')
      : ns.shacl('class');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const shapeId: NamedOrBlankNode = this.propertyIdToShapeIdMap.get(
      subject.value,
    )!;
    const domain: RDF.NamedNode | undefined = store.getDomain(subject);

    if (!domain) {
      throw new Error(
        `Unable to find the domain for subject "${subject.value}".`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const domainShapeId: NamedOrBlankNode = this.classIdToShapeIdMap.get(
      domain.value,
    )!;

    // Special handling for properties that should allow typed values
    // https://vlaamseoverheid.atlassian.net/browse/SDTT-368
    const isTypedStringProperty =
      assignedURI.equals(ns.skos('notation')) ||
      // Add other properties that need to allow typed values
      false;

    // For these base quads, we add a graph so that every other handler can extract these base quads
    const baseQuadsGraph = this.df.namedNode(`baseQuadsGraph`);
    shaclStore.addQuads([
      this.df.quad(shapeId, ns.shacl('path'), assignedURI, baseQuadsGraph),
      this.df.quad(shapeId, ns.shacl('name'), label, baseQuadsGraph),
      this.df.quad(shapeId, ns.rdfs('label'), label, baseQuadsGraph),
      ...(description
        ? [
            this.df.quad(
              shapeId,
              ns.shacl('description'),
              description,
              baseQuadsGraph,
            ),
            this.df.quad(
              shapeId,
              ns.rdfs('comment'),
              description,
              baseQuadsGraph,
            ),
          ]
        : []),
      ...(usageNote
        ? [
            this.df.quad(
              shapeId,
              ns.vann('usageNote'),
              usageNote,
              baseQuadsGraph,
            ),
          ]
        : []),
      // Only add datatype/class constraint if it's not a typed string property
      // https://vlaamseoverheid.atlassian.net/browse/SDTT-368
      ...(isTypedStringProperty
        ? []
        : [
            this.df.quad(
              shapeId,
              propertyTypePredicate,
              rangeAssignedURI,
              baseQuadsGraph,
            ),
          ]),
      this.df.quad(
        domainShapeId,
        ns.shacl('property'),
        shapeId,
        baseQuadsGraph,
      ),
    ]);

    if (this.config.applicationProfileURL) {
      const domainLabel = getApplicationProfileLabel(
        domain,
        store,
        this.config.language,
      );

      if (!domainLabel) {
        throw new Error(
          `Unable to find a label for the domain "${domain.value}" of subject "${subject.value}".`,
        );
      }

      const seeAlso = `${this.config.applicationProfileURL}#${toPascalCase(domainLabel.value)}.${toPascalCase(label.value)}`;

      shaclStore.addQuad(
        this.df.quad(
          shapeId,
          ns.rdfs('seeAlso'),
          this.df.namedNode(seeAlso),
          baseQuadsGraph,
        ),
      );
    }

    if (this.config.addConstraintRuleNumbers) {
      shaclStore.addQuad(
        this.df.quad(
          shapeId,
          ns.vl('rule'),
          this.df.literal('', ns.xsd('string')),
          baseQuadsGraph,
        ),
      );
    }

    super.handle(subject, store, shaclStore);
  }
}
