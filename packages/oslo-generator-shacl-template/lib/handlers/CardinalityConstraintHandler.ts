import { getApplicationProfileLabel, Logger, ns, type QuadStore } from "@oslo-flanders/core";
import type * as RDF from '@rdfjs/types';
import { GenerationMode } from "../enums/GenerationMode";
import { TranslationKey } from "../enums/TranslationKey";
import type { NamedOrBlankNode } from "../types/IHandler";
import { ShaclHandler } from "../types/IHandler";
import { TranslationService } from "../TranslationService";
import { ShaclTemplateGenerationServiceConfiguration } from "../config/ShaclTemplateGenerationServiceConfiguration";
import { ShaclTemplateGenerationServiceIdentifier } from "../config/ShaclTemplateGenerationServiceIdentifier";
import { inject } from "inversify";

export class CardinalityConstraintHandler extends ShaclHandler {
  public constructor(
    @inject(ShaclTemplateGenerationServiceIdentifier.Configuration) config: ShaclTemplateGenerationServiceConfiguration,
    @inject(ShaclTemplateGenerationServiceIdentifier.Logger) logger: Logger,
    @inject(ShaclTemplateGenerationServiceIdentifier.TranslationService) translationService: TranslationService,
  ) {
    super(config, logger, translationService);
  }

  public handle(
    subject: NamedOrBlankNode,
    store: QuadStore,
    shaclStore: QuadStore): void {
    const shapeId: NamedOrBlankNode = this.propertyIdToShapeIdMap.get(subject.value)!;
    const maxCount = store.getMaxCardinality(subject);
    if (maxCount) {
      this.addCardinalityConstraintToStore(subject, shapeId, ns.shacl('maxCount'), maxCount, store, shaclStore);
    }

    const minCount = store.getMinCardinality(subject);
    if (minCount) {
      this.addCardinalityConstraintToStore(subject, shapeId, ns.shacl('minCount'), minCount, store, shaclStore);
    }

    super.handle(subject, store, shaclStore);
  }

  private addCardinalityConstraintToStore(
    subject: NamedOrBlankNode,
    shapeId: NamedOrBlankNode,
    predicate: RDF.NamedNode,
    object: RDF.Literal,
    store: QuadStore,
    shaclStore: QuadStore,
  ): void {
    if ((predicate.equals(ns.shacl('maxCount')) && object.value === '*') || (predicate.equals(ns.shacl('minCount')) && object.value === '0')) {
      return;
    }

    if (this.config.mode === GenerationMode.Grouped) {
      shaclStore.addQuad(
        this.df.quad(shapeId, predicate, object),
      )
    } else {
      const quads: RDF.Quad[] = [];
      const baseQuads = shaclStore.findQuads(shapeId, null, null, this.df.namedNode('baseQuadsGraph'));
      const constraintId = `${shapeId.value}-${predicate.equals(ns.shacl('maxCount')) ? 'MaxCountConstraint' : 'MinCountConstraint'}`;
      quads.push(...baseQuads.map((quad) => {
        if (quad.predicate.equals(ns.shacl('property'))) {
          return <RDF.Quad>this.df.quad(quad.subject, quad.predicate, this.df.namedNode(constraintId))
        }
        return <RDF.Quad>this.df.quad(this.df.namedNode(constraintId), quad.predicate, quad.object)
      }));

      if (this.config.addConstraintMessages) {
        const label = getApplicationProfileLabel(subject, store, this.config.language);
        if (!label) {
          throw new Error(`Unable to find the label for subject "${subject.value}".`);
        }

        const constraintMessage =
          this.translationService.translate(
            predicate.equals(ns.shacl('maxCount')) ?
              TranslationKey.MaxCountConstraint :
              TranslationKey.MinCountConstraint,
            { label: label.value, count: object.value });

        quads.push(
          this.df.quad(this.df.namedNode(constraintId), ns.vl('message'), this.df.literal(constraintMessage)));
      }

      quads.push(
        this.df.quad(this.df.namedNode(constraintId), predicate, object),
      );

      shaclStore.addQuads(quads);
    }
  }
}
