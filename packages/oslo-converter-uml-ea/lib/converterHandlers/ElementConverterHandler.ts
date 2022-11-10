import { ns } from '@oslo-flanders/core';
import type { DataRegistry, EaElement } from '@oslo-flanders/ea-uml-extractor';
import { ConnectorType, ElementType } from '@oslo-flanders/ea-uml-extractor';
import type * as RDF from '@rdfjs/types';
import { injectable } from 'inversify';
import type * as N3 from 'n3';
import { CasingTypes } from '../enums/CasingTypes';
import { TagNames } from '../enums/TagNames';
import { ConverterHandler } from '../interfaces/ConverterHandler';
import type { UriRegistry } from '../UriRegistry';
import { extractUri, getDefininingPackageUri, getTagValue, ignore } from '../utils/utils';

@injectable()
export class ElementConverterHandler extends ConverterHandler<EaElement> {
  public async filterIgnoredObjects(model: DataRegistry): Promise<DataRegistry> {
    model.elements = model.elements.filter(x => !ignore(x));

    return model;
  }

  public async convert(model: DataRegistry, uriRegistry: UriRegistry, store: RDF.Store): Promise<RDF.Store> {
    // All elements will be processed and receive a URI, but only elements on the target diagram
    // will be passed to the OutputHandler. This flow is necessary because element types could be
    // in other packages and their URIs are needed to refer to in the output file.
    model.elements
      .filter(x => model.targetDiagram.elementIds.includes(x.id))
      .forEach(object => (<N3.Store>store).addQuads(this.createQuads(object, uriRegistry, model)));

    return store;
  }

  public async normalize(model: DataRegistry): Promise<DataRegistry> {
    return model;
  }

  public async assignUris(model: DataRegistry, uriRegistry: UriRegistry): Promise<UriRegistry> {
    uriRegistry.elementIdUriMap = new Map<number, URL>();
    uriRegistry.elementNameToElementMap = new Map<string, EaElement[]>();

    model.elements.forEach(element => {
      const packageUri = uriRegistry.packageIdUriMap.get(element.packageId);

      if (!packageUri) {
        // TODO: log message
        return;
      }

      const packageNameTag = getTagValue(element, TagNames.DefiningPackage, null);
      let elementPackageUri = packageUri;

      if (packageNameTag) {
        elementPackageUri = getDefininingPackageUri(uriRegistry, packageNameTag, elementPackageUri);
      }

      const extractedUri = extractUri(element, elementPackageUri, CasingTypes.PascalCase);
      uriRegistry.elementIdUriMap.set(element.id, extractedUri);
      uriRegistry.elementNameToElementMap.set(
        element.name,
        [...uriRegistry.elementNameToElementMap.get(element.name) || [], element],
      );
    });

    return uriRegistry;
  }

  public createQuads(object: EaElement, uriRegistry: UriRegistry, model: DataRegistry): RDF.Quad[] {
    const quads: RDF.Quad[] = [];
    const objectUri = uriRegistry.elementIdUriMap.get(object.id);

    if (!objectUri) {
      throw new Error(`Element with type ${object.type} and EA guid ${object.eaGuid} has no URI assigned.`);
    }

    const objectUriNamedNode = this.df.namedNode(objectUri.toString());

    // In case the URI is a skos:Concept, we do not publish
    // its information.
    // The only time information about a skos:Concept
    // is published, is when an attribute its range
    // is a skos:Concept. Then information about the skos:Concept
    // is published as part of an rdf:Statement about the range
    if (objectUriNamedNode.equals(ns.skos('Concept'))) {
      return quads;
    }

    const definitionValues = this.getDefinition(object);
    definitionValues.forEach(value => quads.push(this.df.quad(objectUriNamedNode, ns.rdfs('comment'), value)));

    const usageNoteValues = this.getUsageNote(object);
    usageNoteValues.forEach(value => quads.push(this.df.quad(objectUriNamedNode, ns.vann('usageNote'), value)));

    const packageBaseUri = uriRegistry.packageIdUriMap.get(model.targetDiagram.packageId);

    if (!packageBaseUri) {
      throw new Error(`Unnable to find URI for the package (EA guid: ${model.targetDiagram.eaGuid}) containing the target diagram when converting EaElements.`);
    }

    const scope = this.getScope(object, packageBaseUri.toString(), uriRegistry.elementIdUriMap);

    quads.push(this.df.quad(
      objectUriNamedNode,
      ns.example('scope'),
      this.df.literal(scope),
    ));

    switch (object.type) {
      case ElementType.Class:
        quads.push(...this.createClassSpecificQuads(object, objectUriNamedNode, uriRegistry, model));
        break;

      case ElementType.DataType:
        quads.push(...this.createDataTypeSpecificQuads(object, objectUriNamedNode, uriRegistry, model));
        break;

      case ElementType.Enumeration:
        quads.push(...this.createEnumerationSpecificQuads(object, objectUriNamedNode, uriRegistry, model));
        break;

      default:
        throw new Error(`Object type (${object.type}) is not supported.`);
    }

    return quads;
  }

  private createClassSpecificQuads(
    object: EaElement,
    objectUriNamedNode: RDF.NamedNode,
    uriRegistry: UriRegistry,
    model: DataRegistry,
  ): RDF.Quad[] {
    const quads: RDF.Quad[] = [];

    quads.push(
      this.df.quad(
        objectUriNamedNode,
        ns.rdf('type'),
        ns.owl('Class'),
      ),
    );

    const labelLiterals = this.getLabel(object);
    labelLiterals.forEach(x => quads.push(this.df.quad(objectUriNamedNode, ns.rdfs('label'), x)));

    const parentClasses = model.normalizedConnectors
      .filter(x => x.originalType === ConnectorType.Generalization && x.sourceObjectId === object.id);

    if (parentClasses.length === 0) {
      return quads;
    }

    parentClasses.forEach(parentClassObject => {
      const parentUri = uriRegistry.elementIdUriMap.get(parentClassObject.destinationObjectId);

      if (!parentUri) {
        throw new Error(`EaElement with EA guid ${object.eaGuid} has a parent with EA guid ${parentClassObject.eaGuid}, but can't find its URI.`);
      }

      const parentUriNamedNode = this.df.namedNode(parentUri.toString());

      if (!model.targetDiagram.connectorsIds.includes(parentClassObject.originalId)) {
        // FIXME: tags are tempty (coming from connector handler)
        const definitionValues = this.getDefinition(<any>parentClassObject);
        const labelValues = this.getLabel(<any>parentClassObject);

        const statementBlankNode = this.df.blankNode();
        quads.push(
          this.df.quad(
            statementBlankNode,
            ns.rdf('type'),
            ns.rdf('Statement'),
          ),
          this.df.quad(
            statementBlankNode,
            ns.rdf('subject'),
            objectUriNamedNode,
          ),
          this.df.quad(
            statementBlankNode,
            ns.rdf('predicate'),
            ns.rdfs('subClassOf'),
          ),
          this.df.quad(
            statementBlankNode,
            ns.rdf('object'),
            parentUriNamedNode,
          ),
        );

        definitionValues.forEach(x => quads.push(this.df.quad(statementBlankNode, ns.rdfs('comment'), x)));
        labelValues.forEach(x => quads.push(this.df.quad(statementBlankNode, ns.rdfs('label'), x)));
      }

      quads.push(this.df.quad(
        objectUriNamedNode,
        ns.rdfs('subClassOf'),
        this.df.namedNode(parentUri?.toString()),
      ));
    });

    return quads;
  }

  private createDataTypeSpecificQuads(
    object: EaElement,
    objectUriNamedNode: RDF.NamedNode,
    uriRegistry: UriRegistry,
    model: DataRegistry,
  ): RDF.Quad[] {
    const quads: RDF.Quad[] = [];

    quads.push(
      this.df.quad(
        objectUriNamedNode,
        ns.rdf('type'),
        ns.example('DataType'),
      ),
    );

    const labelLiterals = this.getLabel(object);
    labelLiterals.forEach(x => quads.push(this.df.quad(objectUriNamedNode, ns.rdfs('label'), x)));

    return quads;
  }

  private createEnumerationSpecificQuads(
    object: EaElement,
    objectUriNamedNode: RDF.NamedNode,
    uriRegistry: UriRegistry,
    model: DataRegistry,
  ): RDF.Quad[] {
    const quads: RDF.Quad[] = [];

    quads.push(
      this.df.quad(
        objectUriNamedNode,
        ns.rdf('type'),
        ns.owl('Class'),
      ),
    );

    // FIXME: this should be available through a tag (language-aware)
    const label = this.df.literal(object.name);
    quads.push(this.df.quad(objectUriNamedNode, ns.rdfs('label'), label));

    const codelist = getTagValue(object, TagNames.ApCodelist, null);

    if (codelist) {
      quads.push(this.df.quad(objectUriNamedNode, ns.example('codelist'), this.df.namedNode(codelist)));
    }

    return quads;
  }
}
