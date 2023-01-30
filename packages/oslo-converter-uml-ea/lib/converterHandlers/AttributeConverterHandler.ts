import { URL } from 'url';
import { ns, PropertyType } from '@oslo-flanders/core';
import type { DataRegistry, EaAttribute, EaElement } from '@oslo-flanders/ea-uml-extractor';
import { ElementType } from '@oslo-flanders/ea-uml-extractor';
import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import type * as N3 from 'n3';
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

  public async convert(model: DataRegistry, uriRegistry: UriRegistry, store: RDF.Store): Promise<RDF.Store> {
    // Only attributes of elements that are on the target diagram will be passed to the output handler
    model.attributes
      .filter(x => model.targetDiagram.elementIds.includes(x.classId))
      .forEach(object => (<N3.Store>store).addQuads(this.createQuads(object, uriRegistry, model)));

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
        throw new Error(`Unable to find domain for attribute with EA guid ${attribute.eaGuid}.`);
      }

      let attributeBaseUri: URL;
      const packageTagValue = getTagValue(attribute, TagNames.DefiningPackage, null);

      if (packageTagValue) {
        const referencedPackages = uriRegistry.packageNameToPackageMap.get(packageTagValue);

        if (referencedPackages && referencedPackages.length > 1) {
          this.logger.warn(`[AttributeConverterHandler]: Multiple packages discovered through name tag "${packageTagValue}".`);
        }

        if (!referencedPackages) {
          throw new Error(`[ElementConverterHandler]: Package tag was defined, but unable to find the objects.`);
        }

        attributeBaseUri = uriRegistry.packageIdUriMap.get(referencedPackages[0].packageId)!;
      } else if (!uriRegistry.packageIdUriMap.has(attributeClass.packageId)) {
        throw new Error(`Unable to determine the package of attribute with EA guid ${attribute.eaGuid}.`);
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
    const attributeWellKnownId = this.df.namedNode(`${this.config.baseUri}/.well-known/id/${object.osloGuid}`);
    const attributeUri = uriRegistry.attributeIdUriMap.get(object.id);

    if (!attributeUri) {
      throw new Error(`Attribute with EA guid ${object.eaGuid} was not assigned a URI.`);
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
      rangeUri = `${this.config.baseUri}/.well-known/id/${rangeElement.osloGuid}`;
      rangeLabel = object.type;
    } else {
      attributeType = PropertyType.Property;
    }

    if (!rangeUri) {
      throw new Error(`Unable to get the URI for the range of attribute with EA guid ${object.eaGuid}`);
    }

    const rangeUriNamedNode = this.df.namedNode(rangeUri);

    quads.push(
      this.df.quad(
        attributeWellKnownId,
        ns.rdf('type'),
        this.df.namedNode(attributeType),
      ),
      this.df.quad(
        attributeWellKnownId,
        ns.example('assignedUri'),
        attributeUriNamedNode,
      ),
      this.df.quad(
        attributeWellKnownId,
        ns.rdfs('range'),
        rangeUriNamedNode,
      ),
    );

    quads.push(...this.addRangeRdfStatement(attributeWellKnownId, rangeUriNamedNode, model, rangeLabel, rangeElement));

    const definitionLiterals = this.getDefinition(object);
    definitionLiterals.forEach(x => quads.push(this.df.quad(attributeWellKnownId, ns.rdfs('comment'), x)));

    const labelLiterals = this.getLabel(object);
    labelLiterals.forEach(x => quads.push(this.df.quad(attributeWellKnownId, ns.rdfs('label'), x)));

    const usageNoteLiterals = this.getUsageNote(object);
    usageNoteLiterals.forEach(x => quads.push(this.df.quad(attributeWellKnownId, ns.vann('usageNote'), x)));

    const domainClass = model.elements.find(x => x.id === object.classId);
    if (domainClass) {
      const domainWellKnownId = this.df.namedNode(`${this.config.baseUri}/.well-known/id/${domainClass.osloGuid}`);

      quads.push(
        this.df.quad(
          attributeWellKnownId,
          ns.rdfs('domain'),
          domainWellKnownId,
        ),
      );
    }

    const packageBaseUri = uriRegistry.packageIdUriMap.get(model.targetDiagram.packageId);

    if (!packageBaseUri) {
      throw new Error(`Unnable to find URI for the package (EA guid: ${model.targetDiagram.eaGuid}) containing the target diagram when converting EaAttributes.`);
    }

    const scope = this.getScope(object, packageBaseUri.toString(), uriRegistry.attributeIdUriMap);
    quads.push(this.df.quad(
      attributeWellKnownId,
      ns.example('scope'),
      this.df.literal(scope),
    ));

    quads.push(
      this.df.quad(
        attributeWellKnownId,
        ns.shacl('minCount'),
        this.df.literal(object.lowerBound),
      ),
      this.df.quad(
        attributeWellKnownId,
        ns.shacl('maxCount'),
        this.df.literal(object.upperBound),
      ),
    );

    const parentUri = getTagValue(object, TagNames.ParentUri, null);
    if (parentUri) {
      quads.push(
        this.df.quad(
          attributeWellKnownId,
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
      const definitionValues = this.getDefinition(<any>rangeElement);
      definitionValues.forEach(x => quads.push(this.df.quad(statementBlankNode, ns.rdfs('comment'), x)));

      const usageNoteValues = this.getUsageNote(<any>rangeElement);
      usageNoteValues.forEach(x => quads.push(this.df.quad(statementBlankNode, ns.vann('usageNote'), x)));

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
