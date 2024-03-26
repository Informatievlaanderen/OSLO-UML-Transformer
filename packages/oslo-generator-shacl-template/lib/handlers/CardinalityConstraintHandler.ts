import { getApplicationProfileLabel, ns, type QuadStore } from "@oslo-flanders/core";
import type * as RDF from '@rdfjs/types';
import { GenerationMode } from "@oslo-generator-shacl-template/enums/GenerationMode";
import { TranslationKey } from "@oslo-generator-shacl-template/enums/TranslationKey";
import type { NamedOrBlankNode } from "@oslo-generator-shacl-template/types/IHandler";
import { ShaclHandler } from "@oslo-generator-shacl-template/types/IHandler";

export class CardinalityConstraintHandler extends ShaclHandler {
  public handle(
    subject: NamedOrBlankNode,
    store: QuadStore,
    shaclStore: QuadStore): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    if (this.config.mode === GenerationMode.Grouped) {
      shaclStore.addQuad(
        this.df.quad(shapeId, predicate, object),
      )
    } else {
      const quads: RDF.Quad[] = [];
      const baseQuads = store.findQuads(shapeId, null, null, null);
      const constraintId = `${shapeId.value}-${predicate.equals(ns.shacl('maxCount')) ? 'MaxCountConstraint' : 'MinCountConstraint'}`;
      quads.push(...baseQuads.map((quad) =>
        <RDF.Quad>this.df.quad(this.df.namedNode(constraintId), quad.predicate, quad.object)));

      const label = getApplicationProfileLabel(subject, store, this.config.language);
      if (!label) {
        throw new Error(`Unable to find the label for subject "${subject.value}".`);
      }

      if (this.config.addConstraintMessages) {
        const constraintMessage =
          this.translationService.translate(
            predicate.equals(ns.shacl('maxCount')) ?
              TranslationKey.MaxCountConstraint :
              TranslationKey.MinCountConstraint,
            { label: label.value });

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