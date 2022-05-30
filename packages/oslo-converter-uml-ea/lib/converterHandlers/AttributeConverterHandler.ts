import { ns, PropertyType } from '@oslo-flanders/core';
import type { EaAttribute, EaDiagram, EaObject } from '@oslo-flanders/ea-uml-extractor';
import { DataTypes } from '../enums/Datatypes';
import { RequestType } from '../enums/RequestType';
import { TagName } from '../enums/TagName';
import { ConverterHandler } from '../types/ConverterHandler';
import { getTagValue } from '../utils/utils';

export class AttributeConverterHandler extends ConverterHandler<EaAttribute> {
  public async handleRequest(requestType: RequestType, object: EaObject): Promise<void> {
    if (requestType === RequestType.AddAttributeToOutput) {
      return this.addObjectToOutput(<EaAttribute>object, this.mediator.targetDiagram);
    }
    return super.handleRequest(requestType, object);
  }

  public async addObjectToOutput(
    attribute: EaAttribute,
    targetDiagram: EaDiagram,
  ): Promise<void> {
    const attributeUriMap = this.uriAssigner.attributeIdUriMap;
    const elementNameToElementMap = this.uriAssigner.elementNameToElementMap;
    const packageUri = this.uriAssigner.packageIdUriMap.get(targetDiagram.packageId)!;

    const attributeUri = attributeUriMap.get(attribute.id);

    if (!attributeUri) {
      // Log errr
      return;
    }

    const attributeUriNamedNode = this.factory.namedNode(attributeUri);

    // Publish a unique reference of this attribute
    const uniqueInternalIdNamedNode = ns.example(`.well-known/${attribute.osloGuid}`);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.example('guid'), attributeUriNamedNode);

    let range = getTagValue(attribute, TagName.Range, null);
    let attributeType: PropertyType;
    let rangeLabel: string | undefined;

    // 1. Check if there was a range tag
    // 2. If not, check if attribute type belongs to DataTypes (primitive types)
    // 3. If not, check if range is an EaElement
    if (range) {
      const isLiteral = getTagValue(attribute, TagName.IsLiteral, false);
      attributeType = isLiteral === 'true' ? PropertyType.DataTypeProperty : PropertyType.ObjectProperty;
    } else if (DataTypes.has(attribute.type)) {
      attributeType = PropertyType.DataTypeProperty;
      range = DataTypes.get(attribute.type)!;
      rangeLabel = attribute.type;
    } else if (elementNameToElementMap.has(attribute.type)) {
      const elements = elementNameToElementMap.get(attribute.type)!;

      if (elements && elements.length > 1) {
        // TODO: log warning
      }

      const element = elements[0];
      const elementIsLiteral = getTagValue(element, TagName.IsLiteral, false);

      attributeType = elementIsLiteral === 'true' ? PropertyType.DataTypeProperty : PropertyType.ObjectProperty;
      // In case an element is references that is not included on the target diagram
      // We still add it to the output handler
      if (!targetDiagram.elementIds.includes(element.id)) {
        await this.mediator.notify(RequestType.AddElementToOutput, element);
      }

      range = ns.example(`.well-known/${element.osloGuid}`).value;
      rangeLabel = attribute.type;
    } else {
      attributeType = PropertyType.Property;
    }

    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdf('type'), this.factory.namedNode(attributeType));

    const rangeNamedNode = this.factory.namedNode(range);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdfs('range'), rangeNamedNode);

    // Add rangeLabel to the N3.Store if it is not added yet.
    // E.g. when type is string with label 'String', this is only known in the attribute itself
    // So this triple must be added to the store here.
    if (rangeLabel && !rangeNamedNode.value.startsWith(ns.example('.well-known')) &&
      !this.outputHandler.quadExists(rangeNamedNode, ns.rdfs('label'))) {
      this.outputHandler.add(rangeNamedNode, ns.rdfs('label'), this.factory.literal(rangeLabel));
    }

    const definition = this.getDefinition(attribute);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdfs('comment'), definition);

    const label = this.getLabel(attribute);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdfs('label'), label);

    const usageNote = this.getUsageNote(attribute);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.vann('usageNote'), usageNote);

    const domainWellKnownId = this.mediator.getElements().find(x => x.id === attribute.classId)?.osloGuid;
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdfs('domain'), ns.example(`.well-known/${domainWellKnownId}`));

    const scope = this.getScope(attribute, packageUri, attributeUriMap);
    // TODO: remove example.org
    const scopeLiteral = this.factory.literal(scope);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.example('scope'), scopeLiteral);

    this.outputHandler.add(uniqueInternalIdNamedNode, ns.shacl('minCount'), this.factory.literal(attribute.lowerBound));
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.shacl('maxCount'), this.factory.literal(attribute.upperBound));

    const parentUri = getTagValue(attribute, TagName.ParentUri, null);
    if (parentUri) {
      this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdfs('subPropertyOf'), this.factory.namedNode(parentUri));
    }
  }
}
