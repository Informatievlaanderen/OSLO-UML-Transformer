import type { QuadStore } from '@oslo-flanders/core';
import { ns } from '@oslo-flanders/core';
import type { DataRegistry, EaElement } from '@oslo-flanders/ea-uml-extractor';
import { ConnectorType, ElementType } from '@oslo-flanders/ea-uml-extractor';
import type * as RDF from '@rdfjs/types';
import { injectable } from 'inversify';
import { CasingTypes } from '../enums/CasingTypes';
import { TagNames } from '../enums/TagNames';
import { ConverterHandler } from '../interfaces/ConverterHandler';
import type { UriRegistry } from '../UriRegistry';
import { convertToCase, getTagValue, ignore } from '../utils/utils';

@injectable()
export class ElementConverterHandler extends ConverterHandler<EaElement> {
  public async filterIgnoredObjects(model: DataRegistry): Promise<DataRegistry> {
    model.elements = model.elements.filter(x => !ignore(x));

    return model;
  }

  public async convert(model: DataRegistry, uriRegistry: UriRegistry, store: QuadStore): Promise<QuadStore> {
    // All elements will be processed and receive a URI, but only elements on the target diagram
    // will be passed to the OutputHandler. This flow is necessary because element types could be
    // in other packages and their URIs are needed to refer to in the output file.
    model.elements
      .filter(x => model.targetDiagram.elementIds.includes(x.id))
      .forEach(object => store.addQuads(this.createQuads(object, uriRegistry, model)));

    return store;
  }

  public async normalize(model: DataRegistry): Promise<DataRegistry> {
    return model;
  }

  public async assignUris(model: DataRegistry, uriRegistry: UriRegistry): Promise<UriRegistry> {
    uriRegistry.elementIdUriMap = new Map<number, URL>();
    uriRegistry.elementNameToElementMap = new Map<string, EaElement[]>();

    model.elements.forEach(element => {
      const externalUri = getTagValue(element, TagNames.ExternalUri, null);

      if (externalUri) {
        uriRegistry.elementIdUriMap.set(element.id, new URL(externalUri));
        uriRegistry.elementNameToElementMap.set(
          element.name,
          [...uriRegistry.elementNameToElementMap.get(element.name) || [], element],
        );

        return;
      }

      let elementBaseUri: URL;
      const packageTagValue = getTagValue(element, TagNames.DefiningPackage, null);

      if (packageTagValue) {
        const referencedPackages = uriRegistry.packageNameToPackageMap.get(packageTagValue);

        if (referencedPackages && referencedPackages.length > 1) {
          this.logger.warn(`[ElementConverterHandler]: Multiple packages discovered through name tag "${packageTagValue}".`);
        }

        if (!referencedPackages) {
          throw new Error(`[ElementConverterHandler]: Package tag was defined, but unable to find the object for package ${packageTagValue}.`);
        }

        elementBaseUri = uriRegistry.packageIdUriMap.get(referencedPackages[0].packageId)!;
      } else if (uriRegistry.packageIdUriMap.has(element.packageId)) {
        elementBaseUri = uriRegistry.packageIdUriMap.get(element.packageId)!;
      } else {
        this.logger.warn(`[ElementConverterHandler]: Unable to find base URI for element (${element.path}).`);
        elementBaseUri = new URL(uriRegistry.fallbackBaseUri);
      }

      let localName = getTagValue(element, TagNames.LocalName, element.name);
      localName = convertToCase(localName, CasingTypes.PascalCase);

      const elementUri = new URL(`${elementBaseUri}${localName}`);

      uriRegistry.elementIdUriMap.set(element.id, new URL(elementUri));
      uriRegistry.elementNameToElementMap.set(
        element.name,
        [...uriRegistry.elementNameToElementMap.get(element.name) || [], element],
      );
    });

    return uriRegistry;
  }

  public createQuads(object: EaElement, uriRegistry: UriRegistry, model: DataRegistry): RDF.Quad[] {
    const quads: RDF.Quad[] = [];
    const objectWellKnownId = this.df.namedNode(`${this.config.baseUri}/.well-known/id/${object.osloGuid}`);
    const objectUri = uriRegistry.elementIdUriMap.get(object.id);

    if (!objectUri) {
      throw new Error(`[ElementConverterHandler]: Unable to find URI for element (${object.path}).`);
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

    quads.push(
      this.df.quad(
        objectWellKnownId,
        ns.example('assignedUri'),
        objectUriNamedNode,
      ),
    );

    const definitionValues = this.getDefinition(object);
    definitionValues.forEach(value => quads.push(this.df.quad(objectWellKnownId, ns.rdfs('comment'), value)));

    const usageNoteValues = this.getUsageNote(object);
    usageNoteValues.forEach(value => quads.push(this.df.quad(objectWellKnownId, ns.vann('usageNote'), value)));

    const packageBaseUri = uriRegistry.packageIdUriMap.get(model.targetDiagram.packageId);

    if (!packageBaseUri) {
      throw new Error(`[ElementConverterHandler]: Unnable to find URI for the package in which the target diagram (${model.targetDiagram.name}) was placed.`);
    }

    const scope = this.getScope(object, packageBaseUri.toString(), uriRegistry.elementIdUriMap);

    quads.push(this.df.quad(
      objectWellKnownId,
      ns.example('scope'),
      this.df.literal(scope),
    ));

    switch (object.type) {
      case ElementType.Class:
        quads.push(...this.createClassSpecificQuads(object, objectWellKnownId, uriRegistry, model));
        break;

      case ElementType.DataType:
        quads.push(...this.createDataTypeSpecificQuads(object, objectWellKnownId, uriRegistry, model));
        break;

      case ElementType.Enumeration:
        quads.push(...this.createEnumerationSpecificQuads(object, objectWellKnownId, uriRegistry, model));
        break;

      default:
        throw new Error(`[ElementConverterHandler]: Object type (${object.type}) is not supported.`);
    }

    return quads;
  }

  private createClassSpecificQuads(
    object: EaElement,
    objectWellKnownId: RDF.NamedNode,
    uriRegistry: UriRegistry,
    model: DataRegistry,
  ): RDF.Quad[] {
    const quads: RDF.Quad[] = [];

    quads.push(
      this.df.quad(
        objectWellKnownId,
        ns.rdf('type'),
        ns.owl('Class'),
      ),
    );

    const labelLiterals = this.getLabel(object);
    labelLiterals.forEach(x => quads.push(this.df.quad(objectWellKnownId, ns.rdfs('label'), x)));

    // Connectors array is used here, because NormalizedConnectors array doesn't have this type
    const parentClassConnectors = model.connectors
      .filter(x => x.type === ConnectorType.Generalization && x.sourceObjectId === object.id);

    parentClassConnectors.forEach(parentClassConnector => {
      const parentClassObject = model.elements.find(x => x.id === parentClassConnector.destinationObjectId);

      if (!parentClassObject) {
        throw new Error(`[ElementConverterHandler]: Unable to find parent class for class (${object.path}).`);
      }

      const parentWellKnownId = this.df.namedNode(`${this.config.baseUri}/.well-known/id/${parentClassObject.osloGuid}`);

      quads.push(
        this.df.quad(
          objectWellKnownId,
          ns.rdfs('subClassOf'),
          parentWellKnownId,
        ),
      );

      if (!model.targetDiagram.connectorsIds.includes(parentClassConnector.id)) {
        const parentAssignedUri = uriRegistry.elementIdUriMap.get(parentClassObject.id);
        if (!parentAssignedUri) {
          throw new Error(`[ElementConverterHandler]: Unable to find the URI for parent of class (${object.path}).`);
        }

        const definitionValues = this.getDefinition(parentClassObject);
        const labelValues = this.getLabel(parentClassObject);

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
            objectWellKnownId,
          ),
          this.df.quad(
            statementBlankNode,
            ns.rdf('predicate'),
            ns.rdfs('subClassOf'),
          ),
          this.df.quad(
            statementBlankNode,
            ns.rdf('object'),
            parentWellKnownId,
          ),
          this.df.quad(
            statementBlankNode,
            ns.example('assignedUri'),
            this.df.namedNode(parentAssignedUri.toString()),
          ),
        );

        definitionValues.forEach(x => quads.push(this.df.quad(statementBlankNode, ns.rdfs('comment'), x)));
        labelValues.forEach(x => quads.push(this.df.quad(statementBlankNode, ns.rdfs('label'), x)));
      }
    });

    return quads;
  }

  private createDataTypeSpecificQuads(
    object: EaElement,
    objectWellKnownId: RDF.NamedNode,
    uriRegistry: UriRegistry,
    model: DataRegistry,
  ): RDF.Quad[] {
    const quads: RDF.Quad[] = [];

    quads.push(
      this.df.quad(
        objectWellKnownId,
        ns.rdf('type'),
        ns.example('DataType'),
      ),
    );

    const labelLiterals = this.getLabel(object);
    labelLiterals.forEach(x => quads.push(this.df.quad(objectWellKnownId, ns.rdfs('label'), x)));

    return quads;
  }

  private createEnumerationSpecificQuads(
    object: EaElement,
    objectWellKnownId: RDF.NamedNode,
    uriRegistry: UriRegistry,
    model: DataRegistry,
  ): RDF.Quad[] {
    const quads: RDF.Quad[] = [];

    quads.push(
      this.df.quad(
        objectWellKnownId,
        ns.rdf('type'),
        ns.owl('Class'),
      ),
    );

    // FIXME: this should be available through a tag (language-aware)
    const label = this.df.literal(object.name);
    quads.push(this.df.quad(objectWellKnownId, ns.rdfs('label'), label));

    const codelist = getTagValue(object, TagNames.ApCodelist, null);

    if (codelist) {
      quads.push(this.df.quad(objectWellKnownId, ns.example('codelist'), this.df.namedNode(codelist)));
    }

    return quads;
  }
}
