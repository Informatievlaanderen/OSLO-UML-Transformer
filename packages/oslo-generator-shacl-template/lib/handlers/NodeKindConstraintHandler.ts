import { getApplicationProfileLabel, ns, type QuadStore } from "@oslo-flanders/core";
import type * as RDF from '@rdfjs/types';
import { GenerationMode } from "@oslo-generator-shacl-template/enums/GenerationMode";
import { TranslationKey } from "@oslo-generator-shacl-template/enums/TranslationKey";
import type { NamedOrBlankNode } from "@oslo-generator-shacl-template/types/IHandler";
import { ShaclHandler } from "@oslo-generator-shacl-template/types/IHandler";

/**
 * Adds the NodeKind constraint for a property. Based on the type of the property, the sh:nodeKind
 * is sh:IRI or sh:Literal.
 */
export class NodeKindConstraintHandler extends ShaclHandler {
  public handle(
    subject: NamedOrBlankNode,
    store: QuadStore,
    shaclStore: QuadStore,
  ): void {
    const propertyType: RDF.NamedNode | undefined = <RDF.NamedNode | undefined>
      store.findObject(subject, ns.rdf('type'));

    if (!propertyType) {
      throw new Error(`Unable to find the type for subject "${subject.value}".`);
    }

    const nodeKind: RDF.NamedNode = propertyType.equals(ns.owl('DatatypeProperty')) ?
      ns.shacl('BlankNodeOrIRI') : ns.shacl('Literal');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const shapeId: NamedOrBlankNode = this.propertyIdToShapeIdMap.get(subject.value)!;
    if (this.config.mode === GenerationMode.Grouped) {
      this.handleGroupedMode(shapeId, nodeKind, shaclStore);
    } else {
      this.handleIndividualMode(subject, shapeId, nodeKind, store, shaclStore);
    }
    super.handle(subject, store, shaclStore);
  }

  private handleGroupedMode(shapeId: NamedOrBlankNode, nodeKind: RDF.NamedNode, shaclStore: QuadStore): void {
    shaclStore.addQuad(this.df.quad(shapeId, ns.shacl('nodeKind'), nodeKind));
  }

  private handleIndividualMode(
    subject: NamedOrBlankNode,
    shapeId: NamedOrBlankNode,
    nodeKind: RDF.NamedNode,
    store: QuadStore,
    shaclStore: QuadStore,
  ): void {
    const constraintId = `${shapeId.value}-NodeKindConstraint`;
    const baseQuads = shaclStore.findQuads(shapeId, null, null, null);
    shaclStore.addQuads(baseQuads.map((quad) => this.df.quad(this.df.namedNode(constraintId), quad.predicate, quad.object)));

    const label = getApplicationProfileLabel(subject, store, this.config.language);
    if (!label) {
      throw new Error(`Unable to find the label for subject "${subject.value}".`);
    }

    this.addConstraintMessage(constraintId, label, nodeKind, shaclStore);
    shaclStore.addQuad(this.df.quad(this.df.namedNode(constraintId), ns.shacl('nodeKind'), nodeKind));
  }

  private addConstraintMessage(constraintId: string, label: RDF.Literal, nodeKind: RDF.NamedNode, shaclStore: QuadStore): void {
    if (this.config.addConstraintMessages) {
      const constraintMessage = this.translationService.translate(
        nodeKind.equals(ns.shacl('Literal')) ? TranslationKey.NodeKindLiteralConstraint : TranslationKey.NodeKindIRIConstraint,
        { label: label.value },
      );
      shaclStore.addQuad(this.df.quad(this.df.namedNode(constraintId), ns.vl('message'), this.df.literal(constraintMessage)));
    }
  }
}