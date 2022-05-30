import { ns, Scope } from '@oslo-flanders/core';
import type { EaDiagram, EaElement, EaObject } from '@oslo-flanders/ea-uml-extractor';
import { ElementType } from '@oslo-flanders/ea-uml-extractor';
import type * as RDF from '@rdfjs/types';
import { RequestType } from '../enums/RequestType';
import { TagName } from '../enums/TagName';
import { ConverterHandler } from '../types/ConverterHandler';
import { getTagValue } from '../utils/utils';

export class ElementConverterHandler extends ConverterHandler<EaElement> {
  public async handleRequest(requestType: RequestType, object: EaObject): Promise<void> {
    if (requestType === RequestType.AddElementToOutput) {
      return this.addObjectToOutput(<EaElement>object, this.mediator.targetDiagram);
    }
    return super.handleRequest(requestType, object);
  }

  public async addObjectToOutput(
    element: EaElement,
    targetDiagram: EaDiagram,
  ): Promise<void> {
    const elementUriMap = this.uriAssigner.elementIdUriMap;
    const packageUri = this.uriAssigner.packageIdUriMap.get(targetDiagram.packageId)!;

    switch (element.type) {
      case ElementType.Class: {
        return this.convertToOsloClass(element, elementUriMap, packageUri);
      }

      case ElementType.DataType: {
        return this.convertToOsloDataType(element, elementUriMap, packageUri);
      }

      case ElementType.Enumeration: {
        return this.convertToOsloEnumeration(element, elementUriMap);
      }

      default:
        throw new Error(`Element type not supported`);
    }
  }

  private convertToOsloDataType(
    dataType: EaElement,
    elementUriMap: Map<number, string>,
    packageUri: string,
  ): void {
    const dataTypeUri = elementUriMap.get(dataType.id);

    if (!dataTypeUri) {
      // TODO: Log error
      return;
    }

    const dataTypeUriNamedNode = this.factory.namedNode(dataTypeUri);

    // Publish a unique reference of this data type
    const uniqueInternalIdNamedNode = ns.example(`.well-known/${dataType.osloGuid}`);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.example('guid'), dataTypeUriNamedNode);

    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdf('type'), ns.example('DataType'));

    const definition = this.getDefinition(dataType);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdfs('comment'), definition);

    const label = this.getLabel(dataType);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdfs('label'), label);

    const usageNote = this.getUsageNote(dataType);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.vann('usageNote'), usageNote);

    const scope = this.getScope(dataType, packageUri, elementUriMap);
    // TODO: remove example.org
    const scopeLiteral = this.factory.literal(scope);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.example('scope'), scopeLiteral);
  }

  private convertToOsloEnumeration(
    enumeration: EaElement,
    elementUriMap: Map<number, string>,
  ): void {
    /**
     * Since an enumeration is a codelist, and adding its
     * information to an N3.Store, we do not longer know
     * which label, definition and usage note belong together.
     * For that reason, we set a temporary graph for each enumeration
     * object, based on its id.
     * This graph will then be updated in the AttributeConverterHandler
     */
    const enumerationUri = elementUriMap.get(enumeration.id);

    if (!enumerationUri) {
      // TODO: log error
      return;
    }

    const enumerationUriNamedNode = this.factory.namedNode(enumerationUri);

    // Publish a unique reference of this enumeration
    const uniqueInternalIdNamedNode = ns.example(`.well-known/${enumeration.osloGuid}`);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.example('guid'), enumerationUriNamedNode);

    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdf('type'), ns.owl('Class'));

    const definition = this.getDefinition(enumeration);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdfs('comment'), definition);

    // FIXME: this should be available through a tag (language-aware)
    const label = this.factory.literal(enumeration.name);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdfs('label'), label);

    const usageNote = this.getUsageNote(enumeration);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.vann('usageNote'), usageNote);

    const scope = Scope.External;
    // TODO: remove example.org
    const scopeLiteral = this.factory.literal(scope);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.example('scope'), scopeLiteral);

    const codelist = getTagValue(enumeration, TagName.ApCodelist, null);
    // TODO: check what the value of this tag can be - now expecting an IRI
    if (codelist) {
      this.outputHandler.add(uniqueInternalIdNamedNode, ns.example('codelist'), this.factory.namedNode(codelist));
    }
  }

  private convertToOsloClass(
    _class: EaElement,
    elementUriMap: Map<number, string>,
    packageUri: string,
  ): void {
    const classUri = elementUriMap.get(_class.id);

    if (!classUri) {
      // Log error
      return;
    }

    const classUriNamedNode = this.factory.namedNode(classUri);

    // Publish a unique reference of this attribute
    const uniqueInternalIdNamedNode = ns.example(`.well-known/${_class.osloGuid}`);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.example('guid'), classUriNamedNode);

    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdf('type'), ns.owl('Class'));

    const definition = this.getDefinition(_class);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdfs('comment'), definition);

    const label = this.getLabel(_class);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdfs('label'), label);

    const usageNote = this.getUsageNote(_class);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.vann('usageNote'), usageNote);

    const scope = this.getScope(_class, packageUri, elementUriMap);
    // TODO: remove example.org
    const scopeLiteral = this.factory.literal(scope);
    this.outputHandler.add(uniqueInternalIdNamedNode, ns.example('scope'), scopeLiteral);

    const parentClasses = this.mediator.getParentClasses(_class.id);

    // FIXME: use well known id for this
    if (parentClasses.length > 0) {
      const parentUris = parentClasses.reduce<RDF.NamedNode[]>((uris, parentClass) => {
        const parentUri = elementUriMap.get(parentClass.destinationObjectId);

        if (!parentUri) {
          // TODO: log error
        } else {
          uris.push(this.factory.namedNode(parentUri));
        }

        return uris;
      }, []);

      this.outputHandler.add(uniqueInternalIdNamedNode, ns.rdfs('subClassOf'), parentUris);
    }
  }
}
