import { getApplicationProfileDefinition, getApplicationProfileLabel, ns, type QuadStore } from "@oslo-flanders/core";
import type * as RDF from '@rdfjs/types';

import type { NamedOrBlankNode } from "@oslo-generator-shacl-template/types/IHandler";
import { ShaclHandler }
  from "@oslo-generator-shacl-template/types/IHandler";
import { toPascalCase } from "@oslo-generator-shacl-template/utils/utils";

/**
 * Adds the base information for a property shape.
 */
export class PropertyShapeBaseHandler extends ShaclHandler {
  public handle(
    subject: RDF.NamedNode,
    store: QuadStore,
    shaclStore: QuadStore,
  ): void {
    const assignedURI: RDF.NamedNode | undefined = store.getAssignedUri(subject);

    if (!assignedURI) {
      throw new Error(`Unable to find the assigned URI for subject "${subject.value}".`);
    }

    const label: RDF.Literal | undefined = getApplicationProfileLabel(subject, store, this.config.language);

    if (!label) {
      throw new Error(`Unable to find the label for subject "${subject.value}".`);
    }

    const description: RDF.Literal | undefined = getApplicationProfileDefinition(subject, store, this.config.language);

    if (!description) {
      this.logger.error(`Unable to find the description for subject "${subject.value}".`);
    }

    const range: RDF.NamedNode | undefined = store.getRange(subject);

    if (!range) {
      throw new Error(`Unable to find the range for subject "${subject.value}".`);
    }

    const rangeAssignedURI: RDF.NamedNode | undefined = store.getAssignedUri(range);
    if (!rangeAssignedURI) {
      throw new Error(`Unable to find the assigned URI for range "${range.value}".`);
    }

    const propertyType: RDF.NamedNode | undefined = <RDF.NamedNode | undefined>
      store.findObject(subject, ns.rdf('type'));
    if (!propertyType) {
      throw new Error(`Unable to find the type for subject "${subject.value}".`);
    }
    const propertyTypePredicate: RDF.NamedNode = propertyType.equals(ns.owl('DatatypeProperty')) ?
      ns.shacl('datatype') : ns.shacl('class');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const shapeId: NamedOrBlankNode = this.propertyIdToShapeIdMap.get(subject.value)!;
    const domain: RDF.NamedNode | undefined = store.getDomain(subject);

    if (!domain) {
      throw new Error(`Unable to find the domain for subject "${subject.value}".`);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const domainShapeId: NamedOrBlankNode = this.classIdToShapeIdMap.get(domain.value)!;

    shaclStore.addQuads([
      this.df.quad(
        shapeId,
        ns.shacl('path'),
        assignedURI,
      ),
      this.df.quad(
        shapeId,
        ns.shacl('name'),
        label,
      ),
      ...(description ? [this.df.quad(
        shapeId,
        ns.shacl('description'),
        description,
      )] : [])
      ,
      this.df.quad(
        shapeId,
        propertyTypePredicate,
        rangeAssignedURI,
      ),
      this.df.quad(
        domainShapeId,
        ns.shacl('property'),
        shapeId,
      ),
    ])

    if (this.config.applicationProfileURL) {
      const domainLabel = getApplicationProfileLabel(domain, store, this.config.language);

      if (!domainLabel) {
        throw new Error(`Unable to find a label for the domain "${domain.value}" of subject ${subject.value}.`);
      }

      const seeAlso = `${this.config.applicationProfileURL}#${toPascalCase(domainLabel.value)}.${toPascalCase(label.value)}`;

      shaclStore.addQuad(
        this.df.quad(shapeId, ns.rdfs('seeAlso'), this.df.namedNode(seeAlso)),
      )
    }

    if (this.config.addConstraintRuleNumbers) {
      shaclStore.addQuad(
        this.df.quad(
          shapeId,
          ns.vl('rule'),
          this.df.literal('', ns.xsd('string')),
        ),
      )
    }

    super.handle(subject, store, shaclStore);
  }
}