import { URL } from 'url';
import type { QuadStore } from '@oslo-flanders/core';
import { ns, PropertyType } from '@oslo-flanders/core';
import type { DataRegistry, EaAttribute, EaElement } from '@oslo-flanders/ea-uml-extractor';
import { ElementType } from '@oslo-flanders/ea-uml-extractor';
import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import { EaUmlConverterConfiguration } from '../config/EaUmlConverterConfiguration';
import { EaUmlConverterServiceIdentifier } from '../config/EaUmlConverterServiceIdentifier';
import { CasingTypes } from '../enums/CasingTypes';
import { DataTypes } from '../enums/DataTypes';
import { TagNames } from '../enums/TagNames';
import { ConverterHandler } from '../interfaces/ConverterHandler';
import type { UriRegistry } from '../UriRegistry';
import { convertToCase, extractUri, getTagValue, ignore } from '../utils/utils';

@injectable()
export class AttributeConverterHandler extends ConverterHandler<EaAttribute> {
  @inject(EaUmlConverterServiceIdentifier.Configuration) public readonly config!: EaUmlConverterConfiguration;

  public async filterIgnoredObjects(model: DataRegistry): Promise<DataRegistry> {
    model.attributes = model.attributes.filter(x => !ignore(x));

    return model;
  }

  public async convert(model: DataRegistry, uriRegistry: UriRegistry, store: QuadStore): Promise<QuadStore> {
    // Only attributes of elements that are on the target diagram will be passed to the output handler
    // and attributes that have a domain that is not an enumeration
    const enumerationClasses = model.elements.filter(x => x.type === ElementType.Enumeration);
    model.attributes
      .filter(x => model.targetDiagram.elementIds.includes(x.classId) &&
        !enumerationClasses.some(y => y.id === x.classId))
      .forEach(object => store.addQuads(this.createQuads(object, uriRegistry, model)));

    return store;
  }

  public async normalize(model: DataRegistry): Promise<DataRegistry> {
    return model;
  }

  public async assignUris(model: DataRegistry, uriRegistry: UriRegistry): Promise<UriRegistry> {
    uriRegistry.attributeIdUriMap = new Map<number, URL>();

    model.attributes.forEach(attribute => {
      const attributeClass = model.elements.find(x => x.id === attribute.classId);

      if (!attributeClass) {
        throw new Error(`[AttributeConverterHandler]: Unable to find domain for attribute (${attribute.path}).`);
      }

      let attributeBaseUri: URL;
      const packageTagValue = getTagValue(attribute, TagNames.DefiningPackage, null);

      if (packageTagValue) {
        const referencedPackages = uriRegistry.packageNameToPackageMap.get(packageTagValue);

        if (referencedPackages && referencedPackages.length > 1) {
          this.logger.warn(`[AttributeConverterHandler]: Multiple packages discovered through name tag "${packageTagValue}" for attribute (${attribute.path}).`);
        }

        if (!referencedPackages) {
          throw new Error(`[AttributeConverterHandler]: Package tag was defined, but unable to find a related package object for attribute (${attribute.path}).`);
        }

        attributeBaseUri = uriRegistry.packageIdUriMap.get(referencedPackages[0].packageId)!;
      } else if (!uriRegistry.packageIdUriMap.has(attributeClass.packageId)) {
        throw new Error(`[AttributeConverterHandler]: Unable to determine the package of attribute (${attribute.path}).`);
      } else {
        attributeBaseUri = uriRegistry.packageIdUriMap.get(attributeClass.packageId)!;
      }

      if (attributeClass.type === ElementType.Enumeration) {
        let namespace = attributeBaseUri;

        if (namespace.toString().endsWith('/') || namespace.toString().endsWith('#')) {
          namespace = new URL(namespace.toString().slice(0, Math.max(0, namespace.toString().length - 1)));
        }

        let localName = getTagValue(attributeClass, TagNames.LocalName, attributeClass.name);
        localName = convertToCase(localName);

        attributeBaseUri = new URL(`${namespace}/${localName}/`);
      }

      const attributeUri = extractUri(attribute, attributeBaseUri, CasingTypes.CamelCase);
      uriRegistry.attributeIdUriMap.set(attribute.id, attributeUri);
    });

    return uriRegistry;
  }

  public createQuads(object: EaAttribute, uriRegistry: UriRegistry, model: DataRegistry): RDF.Quad[] {
    const quads: RDF.Quad[] = [];
    const attributeInternalId = this.df.namedNode(`${this.baseUrnScheme}:${object.osloGuid}`);
    const attributeUri = uriRegistry.attributeIdUriMap.get(object.id);

    if (!attributeUri) {
      throw new Error(`[AttributeConverterHandler]: Unable to find URI for attribute (${object.path}).`);
    }

    const attributeUriNamedNode = this.df.namedNode(attributeUri.toString());

    let rangeUri = getTagValue(object, TagNames.Range, null);
    let attributeType: PropertyType;
    let rangeLabel: string | undefined;
    let rangeElement: EaElement | undefined;

    // First, it is checked whether a 'range' tag has been defined on the attribute.
    // If that was the case, then there should also be a 'literal' tag defined, that
    // indicates whether the type of the attribute is a literal (DataTypeProperty) or
    // not (ObjectProperty). Using 'range' tags always takes precedence
    // If there was no range tag, the type of the attribute is checked in the list of
    // (primitive) data types.
    // Finally, it is checked whether the type of the attribute is the name of an EaElement.
    // In that case, it can still be a DataTypeProperty, if a 'literal' tag is defined on the EaElement
    // Otherwise, we just set the attribute type to the generic RDF Property
    if (rangeUri) {
      const isLiteral = getTagValue(object, TagNames.IsLiteral, false);
      attributeType = isLiteral === 'true' ? PropertyType.DataTypeProperty : PropertyType.ObjectProperty;
    } else if (DataTypes.has(object.type)) {
      attributeType = PropertyType.DataTypeProperty;
      rangeUri = DataTypes.get(object.type)!;
      rangeLabel = object.type;
    } else if (uriRegistry.elementNameToElementMap.has(object.type)) {
      const elements = uriRegistry.elementNameToElementMap.get(object.type)!;

      if (elements.length > 1) {
        // TODO: log message
      }

      rangeElement = elements[0];
      const elementIsLiteral = getTagValue(rangeElement, TagNames.IsLiteral, false);

      attributeType = elementIsLiteral === 'true' ? PropertyType.DataTypeProperty : PropertyType.ObjectProperty;
      rangeUri = `${this.baseUrnScheme}:${rangeElement.osloGuid}`;
      rangeLabel = object.type;
    } else {
      attributeType = PropertyType.Property;
    }

    if (!rangeUri) {
      throw new Error(`[AttributeConverterHandler]: Unable to get the URI for the range of attribute (${object.path}).`);
    }

    const rangeUriNamedNode = this.df.namedNode(rangeUri);

    quads.push(
      this.df.quad(
        attributeInternalId,
        ns.rdf('type'),
        this.df.namedNode(attributeType),
      ),
      this.df.quad(
        attributeInternalId,
        ns.example('assignedUri'),
        attributeUriNamedNode,
      ),
      this.df.quad(
        attributeInternalId,
        ns.rdfs('range'),
        rangeUriNamedNode,
      ),
    );

    quads.push(...this.addRangeRdfStatement(attributeInternalId, rangeUriNamedNode, model, uriRegistry, rangeLabel, rangeElement));

    const definitionLiterals = this.getDefinition(object);
    definitionLiterals.forEach(x => quads.push(this.df.quad(attributeInternalId, ns.rdfs('comment'), x)));

    const labelLiterals = this.getLabel(object);
    labelLiterals.forEach(x => quads.push(this.df.quad(attributeInternalId, ns.rdfs('label'), x)));

    const usageNoteLiterals = this.getUsageNote(object);
    usageNoteLiterals.forEach(x => quads.push(this.df.quad(attributeInternalId, ns.vann('usageNote'), x)));

    const domainClass = model.elements.find(x => x.id === object.classId);
    if (domainClass) {
      const domainInternalId = this.df.namedNode(`${this.baseUrnScheme}:${domainClass.osloGuid}`);

      quads.push(
        this.df.quad(
          attributeInternalId,
          ns.rdfs('domain'),
          domainInternalId,
        ),
      );
    }

    const packageBaseUri = uriRegistry.packageIdUriMap.get(model.targetDiagram.packageId);

    if (!packageBaseUri) {
      throw new Error(`[AttributeCOnverterHandler]: Unable to find the URI for the package in which the target diagram (${model.targetDiagram.name}) was placed.`);
    }

    const scope = this.getScope(object, packageBaseUri.toString(), uriRegistry.attributeIdUriMap);
    quads.push(this.df.quad(
      attributeInternalId,
      ns.example('scope'),
      this.df.literal(scope),
    ));

    quads.push(
      this.df.quad(
        attributeInternalId,
        ns.shacl('minCount'),
        this.df.literal(object.lowerBound),
      ),
      this.df.quad(
        attributeInternalId,
        ns.shacl('maxCount'),
        this.df.literal(object.upperBound),
      ),
    );

    const parentUri = getTagValue(object, TagNames.ParentUri, null);
    if (parentUri) {
      quads.push(
        this.df.quad(
          attributeInternalId,
          ns.rdfs('subPropertyOf'),
          this.df.namedNode(parentUri),
        ),
      );
    }

    return quads;
  }

  private addRangeRdfStatement(
    attributeUri: RDF.NamedNode,
    rangeUri: RDF.NamedNode,
    model: DataRegistry,
    uriRegistry: UriRegistry,
    rangeLabel?: string,
    rangeElement?: EaElement,
  ): RDF.Quad[] {
    const quads: RDF.Quad[] = [];
    const statementBlankNode = this.df.blankNode();

    if (rangeLabel) {
      quads.push(
        this.df.quad(
          statementBlankNode,
          ns.rdfs('label'),
          this.df.literal(rangeLabel),
        ),
      );
    }

    if (rangeElement &&
      (!model.targetDiagram.elementIds.includes(rangeElement.id) || attributeUri.equals(ns.skos('Concept')))) {
      const definitionValues = <RDF.Literal[]>(<any>this.getDefinition)(rangeElement);
      definitionValues.forEach(x => quads.push(this.df.quad(statementBlankNode, ns.rdfs('comment'), x)));

      const usageNoteValues = <RDF.Literal[]>(<any>this.getUsageNote)(rangeElement);
      usageNoteValues.forEach(x => quads.push(this.df.quad(statementBlankNode, ns.vann('usageNote'), x)));

      const assignedUri = uriRegistry.elementIdUriMap.get(rangeElement.id);
      if(!assignedUri){
        throw new Error(`[AttributeConverterHandler]: Unable to find the assigned URI for the range (${rangeElement.path}) of attribute.`);
      }

      quads.push(
        this.df.quad(
          statementBlankNode,
          ns.example('assignedUri'),
          this.df.namedNode(assignedUri.toString())
        )
      )

      const skosCodelist = getTagValue(rangeElement, TagNames.ApCodelist, null);
      if (skosCodelist) {
        quads.push(
          this.df.quad(
            statementBlankNode,
            ns.example('usesConceptScheme'),
            this.df.namedNode(skosCodelist),
          ),
        );
      }
    }

    if (quads.length > 0) {
      quads.push(
        this.df.quad(
          statementBlankNode,
          ns.rdf('type'),
          ns.rdf('Statement'),
        ),
        this.df.quad(
          statementBlankNode,
          ns.rdf('subject'),
          attributeUri,
        ),
        this.df.quad(
          statementBlankNode,
          ns.rdf('predicate'),
          ns.rdfs('range'),
        ),
        this.df.quad(
          statementBlankNode,
          ns.rdf('object'),
          rangeUri,
        ),
      );
    }

    return quads;
  }
}
