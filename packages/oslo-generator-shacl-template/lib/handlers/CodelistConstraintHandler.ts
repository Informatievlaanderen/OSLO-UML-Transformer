import { Logger, getApplicationProfileLabel, ns, type QuadStore } from "@oslo-flanders/core";
import type * as RDF from "@rdfjs/types";
import { GenerationMode } from "../enums/GenerationMode";
import { TranslationKey } from "../enums/TranslationKey";
import type { NamedOrBlankNode } from "../types/IHandler";
import { ShaclHandler } from "../types/IHandler";
import { TranslationService } from "../TranslationService";
import { ShaclTemplateGenerationServiceConfiguration } from "../config/ShaclTemplateGenerationServiceConfiguration";
import { ShaclTemplateGenerationServiceIdentifier } from "../config/ShaclTemplateGenerationServiceIdentifier";
import { inject } from "inversify";

export class CodelistConstraintHandler extends ShaclHandler {
  public constructor(
    @inject(ShaclTemplateGenerationServiceIdentifier.Configuration) config: ShaclTemplateGenerationServiceConfiguration,
    @inject(ShaclTemplateGenerationServiceIdentifier.Logger) logger: Logger,
    @inject(ShaclTemplateGenerationServiceIdentifier.TranslationService) translationService: TranslationService,
  ) {
    super(config, logger, translationService);
  }

  public handle(
    subject: RDF.NamedNode,
    store: QuadStore,
    shaclStore: QuadStore,
  ): void {
    let codelist: RDF.NamedNode | undefined =
      <RDF.NamedNode | undefined>store.findObject(subject, ns.oslo('codelist'));

    if (!codelist) {
      // When there is no codelist defined on the property, it is possible that is was defined
      // on the range class.
      const range = store.getRange(subject);

      if (!range) {
        throw new Error(`No range found for subject "${subject.value}".`);
      }

      codelist = <RDF.NamedNode | undefined>store.findObject(range, ns.oslo('codelist'));

      if (!codelist) {
        return super.handle(subject, store, shaclStore);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const shapeId: NamedOrBlankNode = this.propertyIdToShapeIdMap.get(subject.value)!;
    this.config.mode === GenerationMode.Grouped ?
      this.handleGroupedMode(shapeId, codelist, shaclStore) :
      this.handleIndividualMode(subject, shapeId, codelist, store, shaclStore);
    super.handle(subject, store, shaclStore);
  }

  private handleGroupedMode(shapeId: NamedOrBlankNode, codelist: RDF.NamedNode, shaclStore: QuadStore): void {
    shaclStore.addQuad(this.df.quad(shapeId, ns.qb('codeList'), codelist));
  }

  private handleIndividualMode(subject: RDF.NamedNode, shapeId: NamedOrBlankNode, codelist: RDF.NamedNode, store: QuadStore, shaclStore: QuadStore): void {
    const baseQuads = shaclStore.findQuads(shapeId, null, null, this.df.namedNode('baseQuadsGraph'));
    const constraintId = `${shapeId.value}-CodelistConstraint`;
    shaclStore.addQuads(baseQuads.map((quad) => {
      if (quad.predicate.equals(ns.shacl('property'))) {
        return <RDF.Quad>this.df.quad(quad.subject, quad.predicate, this.df.namedNode(constraintId))
      }
      return <RDF.Quad>this.df.quad(this.df.namedNode(constraintId), quad.predicate, quad.object)
    }));

    this.addConstraintQuads(constraintId, codelist, shaclStore);

    if (this.config.addConstraintMessages) {
      const label = getApplicationProfileLabel(subject, store, this.config.language);
      if (!label) {
        throw new Error(`Unable to find the label for subject "${subject.value}".`);
      }

      const constraintMessage =
        this.translationService.translate(TranslationKey.CodelistConstraint,
          { label: label.value, codelist: codelist.value });

      shaclStore.addQuad(
        this.df.quad(this.df.namedNode(constraintId), ns.vl('message'), this.df.literal(constraintMessage)));
    }
  }

  private addConstraintQuads(constraintId: string, codelist: RDF.NamedNode, shaclStore: QuadStore): void {
    const nodeBlankNode = this.df.blankNode();
    const propertyBlankNode = this.df.blankNode();
    shaclStore.addQuads(
      [
        this.df.quad(this.df.namedNode(constraintId), ns.shacl('node'), nodeBlankNode),
        this.df.quad(nodeBlankNode, ns.rdf('type'), ns.shacl('NodeConstraint')),
        this.df.quad(nodeBlankNode, ns.shacl('property'), propertyBlankNode),
        this.df.quad(propertyBlankNode, ns.shacl('class'), ns.skos('ConceptScheme')),
        this.df.quad(propertyBlankNode, ns.shacl('hasValue'), codelist),
        this.df.quad(propertyBlankNode, ns.shacl('minCount'), this.df.literal('1', ns.xsd('integer'))),
        this.df.quad(propertyBlankNode, ns.shacl('nodeKind'), ns.shacl('IRI')),
        this.df.quad(propertyBlankNode, ns.shacl('path'), ns.skos('inScheme')),
        this.df.quad(this.df.namedNode(constraintId), ns.shacl('nodeKind'), ns.shacl('IRI')),
      ]);
  }
}