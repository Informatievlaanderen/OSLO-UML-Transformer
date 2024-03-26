import { getApplicationProfileLabel, ns, type QuadStore } from "@oslo-flanders/core";
import type * as RDF from '@rdfjs/types';
import { GenerationMode } from "@oslo-generator-shacl-template/enums/GenerationMode";
import { TranslationKey } from "@oslo-generator-shacl-template/enums/TranslationKey";
import type { NamedOrBlankNode } from "@oslo-generator-shacl-template/types/IHandler";
import { ShaclHandler } from "@oslo-generator-shacl-template/types/IHandler";

export class UniqueLanguageConstraintHandler extends ShaclHandler {
  public handle(
    subject: NamedOrBlankNode,
    store: QuadStore,
    shaclStore: QuadStore,
  ): void {
    const range: RDF.NamedNode | undefined = <RDF.NamedNode | undefined>store.findObject(subject, ns.rdfs('range'));

    if (!range) {
      throw new Error(`Unable to find the range for subject "${subject.value}".`);
    }

    const rangeAssignedURI = store.getAssignedUri(range);

    if (!rangeAssignedURI) {
      throw new Error(`Unable to find the assigned URI for range "${range.value}".`);
    }

    if (rangeAssignedURI.equals(ns.rdf('langString'))) {
      const quads: RDF.Quad[] = [];

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const shapeId: NamedOrBlankNode = this.propertyIdToShapeIdMap.get(subject.value)!;
      if (this.config.mode === GenerationMode.Grouped) {
        this.handleGroupedMode(shapeId, shaclStore);
      } else {
        this.handleIndividualMode(subject, shapeId, store, shaclStore);
      }
    }
    super.handle(subject, store, shaclStore);
  }

  private handleGroupedMode(shapeId: NamedOrBlankNode, shaclStore: QuadStore): void {
    shaclStore.addQuad(this.df.quad(shapeId, ns.shacl('uniqueLang'), this.df.literal('true', ns.xsd('boolean'))));
  }

  private handleIndividualMode(subject: NamedOrBlankNode, shapeId: NamedOrBlankNode, store: QuadStore, shaclStore: QuadStore): void {
    const baseQuads = shaclStore.findQuads(shapeId, null, null, null);
    const constraintId = `${shapeId.value}-UniqueLangConstraint`;
    shaclStore.addQuads(baseQuads.map((quad) =>
      <RDF.Quad>this.df.quad(this.df.namedNode(constraintId), quad.predicate, quad.object)));

    const label = getApplicationProfileLabel(subject, store, this.config.language);
    if (!label) {
      throw new Error(`Unable to find the label for subject "${subject.value}".`);
    }

    this.addConstraintMessage(constraintId, label, shaclStore);
    shaclStore.addQuad(this.df.quad(this.df.namedNode(constraintId), ns.shacl('uniqueLang'), this.df.literal('true', ns.xsd('boolean'))));
  }

  private addConstraintMessage(
    constraintId: string,
    label: RDF.Literal,
    shaclStore: QuadStore,
  ): void {
    if (this.config.addConstraintMessages) {
      const constraintMessage =
        this.translationService.translate(TranslationKey.UniqueLanguageConstraint, { label: label.value });

      shaclStore.addQuad(
        this.df.quad(
          this.df.namedNode(constraintId),
          ns.vl('message'),
          this.df.literal(constraintMessage),
        ),
      )
    }
  }
}