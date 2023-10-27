import { URL } from 'url';
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
  public async filterIgnoredObjects(
    model: DataRegistry
  ): Promise<DataRegistry> {
    model.elements = model.elements.filter((x) => !ignore(x));

    return model;
  }

  public async convert(
    model: DataRegistry,
    uriRegistry: UriRegistry,
    store: QuadStore
  ): Promise<QuadStore> {
    // All elements will be processed and receive a URI, but only elements on the target diagram
    // will be passed to the OutputHandler. This flow is necessary because element types could be
    // in other packages and their URIs are needed to refer to in the output file.
    model.elements
      .filter((x) => model.targetDiagram.elementIds.includes(x.id))
      .forEach((object) =>
        store.addQuads(this.createQuads(object, uriRegistry, model))
      );

    return store;
  }

  public async normalize(model: DataRegistry): Promise<DataRegistry> {
    return model;
  }

  public async assignUris(
    model: DataRegistry,
    uriRegistry: UriRegistry
  ): Promise<UriRegistry> {
    uriRegistry.elementIdUriMap = new Map<number, URL>();
    uriRegistry.elementNameToElementMap = new Map<string, EaElement[]>();

    model.elements.forEach((element) => {
      const externalUri = getTagValue(element, TagNames.ExternalUri, null);

      if (externalUri) {
        uriRegistry.elementIdUriMap.set(element.id, new URL(externalUri));
        uriRegistry.elementNameToElementMap.set(element.name, [
          ...(uriRegistry.elementNameToElementMap.get(element.name) || []),
          element,
        ]);

        return;
      }

      let elementBaseUri: URL;
      const packageTagValue = getTagValue(
        element,
        TagNames.DefiningPackage,
        null
      );

      if (packageTagValue) {
        const referencedPackages =
          uriRegistry.packageNameToPackageMap.get(packageTagValue);

        if (referencedPackages && referencedPackages.length > 1) {
          this.logger.warn(
            `[ElementConverterHandler]: Multiple packages discovered through name tag "${packageTagValue}".`
          );
        }

        if (!referencedPackages) {
          throw new Error(
            `[ElementConverterHandler]: Package tag was defined, but unable to find the object for package ${packageTagValue}.`
          );
        }

        elementBaseUri = uriRegistry.packageIdUriMap.get(
          referencedPackages[0].packageId
        )!;
      } else if (uriRegistry.packageIdUriMap.has(element.packageId)) {
        elementBaseUri = uriRegistry.packageIdUriMap.get(element.packageId)!;
      } else {
        this.logger.warn(
          `[ElementConverterHandler]: Unable to find base URI for element (${element.path}).`
        );
        elementBaseUri = new URL(uriRegistry.fallbackBaseUri);
      }

      let localName = getTagValue(element, TagNames.LocalName, element.name);
      localName = convertToCase(localName, CasingTypes.PascalCase);

      const elementUri = new URL(`${elementBaseUri}${localName}`);

      uriRegistry.elementIdUriMap.set(element.id, elementUri);
      uriRegistry.elementNameToElementMap.set(element.name, [
        ...(uriRegistry.elementNameToElementMap.get(element.name) || []),
        element,
      ]);
    });

    return uriRegistry;
  }

  public createQuads(
    object: EaElement,
    uriRegistry: UriRegistry,
    model: DataRegistry
  ): RDF.Quad[] {
    const quads: RDF.Quad[] = [];
    const objectInternalId = this.df.namedNode(
      `${this.baseUrnScheme}:${object.osloGuid}`
    );
    const objectUri = uriRegistry.elementIdUriMap.get(object.id);

    if (!objectUri) {
      throw new Error(
        `[ElementConverterHandler]: Unable to find URI for element (${object.path}).`
      );
    }

    const objectUriNamedNode = this.df.namedNode(objectUri.toString());

    quads.push(
      this.df.quad(objectInternalId, ns.oslo('assignedURI'), objectUriNamedNode)
    );

    this.addDefinitions(
      object,
      objectInternalId,
      this.df.defaultGraph(),
      quads
    );
    this.addLabels(object, objectInternalId, this.df.defaultGraph(), quads);
    this.addUsageNotes(object, objectInternalId, this.df.defaultGraph(), quads);

    // To be able to determine the scope of the element,
    // we need to compare it to the base URI of the package
    // which holds the target diagram.
    const packageBaseUri = uriRegistry.packageIdUriMap.get(
      model.targetDiagram.packageId
    );

    if (!packageBaseUri) {
      throw new Error(
        `[ElementConverterHandler]: Unnable to find URI for the package in which the target diagram (${model.targetDiagram.name}) was placed.`
      );
    }

    this.addScope(
      object,
      objectInternalId,
      packageBaseUri.toString(),
      uriRegistry.elementIdUriMap,
      quads
    );

    quads.push(
      ...this.getParentInformationQuads(
        object,
        objectInternalId,
        uriRegistry,
        model
      )
    );

    quads.push(...this.getCodelistQuads(object, objectInternalId));

    switch (object.type) {
      case ElementType.Enumeration:
      case ElementType.Class:
        quads.push(
          this.df.quad(objectInternalId, ns.rdf('type'), ns.owl('Class'))
        );
        break;

      case ElementType.DataType:
        quads.push(
          this.df.quad(objectInternalId, ns.rdf('type'), ns.rdfs('Datatype'))
        );
        break;

      default:
        throw new Error(
          `[ElementConverterHandler]: Object type (${object.type}) is not supported.`
        );
    }

    return quads;
  }

  private getParentInformationQuads(
    object: EaElement,
    objectInternalId: RDF.NamedNode,
    uriRegistry: UriRegistry,
    model: DataRegistry
  ): RDF.Quad[] {
    const quads: RDF.Quad[] = [];

    // We search for a parent URI via the "parent" tag on the element
    // ODO: use function getTagValue to get parentURI tags
    const parentURITags = object.tags.filter(
      (x) => x.tagName === TagNames.ParentUri
    );
    if (parentURITags.length > 0) {
      parentURITags.forEach((x) => {
        quads.push(
          this.df.quad(
            objectInternalId,
            ns.rdfs('subClassOf'),
            this.df.namedNode(x.tagValue)
          )
        );
      });
    }

    // We also search for parent relationships via connectors
    // Connectors array is used here, because NormalizedConnectors array doesn't have this type
    const parentClassConnectors = model.connectors.filter(
      (x) =>
        x.type === ConnectorType.Generalization &&
        x.sourceObjectId === object.id
    );

    parentClassConnectors.forEach((parentClassConnector) => {
      const parentClassObject = model.elements.find(
        (x) => x.id === parentClassConnector.destinationObjectId
      );

      if (!parentClassObject) {
        throw new Error(
          `[ElementConverterHandler]: Unable to find parent object for class (${object.path}).`
        );
      }

      const parentInternalId = this.df.namedNode(
        `${this.baseUrnScheme}:${parentClassObject.osloGuid}`
      );

      quads.push(
        this.df.quad(objectInternalId, ns.rdfs('subClassOf'), parentInternalId)
      );

      // In case the parent object is not visible on the target diagram
      // we still add all the information, but put it in a different graph in the quad store
      // so that we can separate it in the OSLO JSON-LD
      if (
        !model.targetDiagram.connectorsIds.includes(parentClassConnector.id)
      ) {
        const parentAssignedUri = uriRegistry.elementIdUriMap.get(
          parentClassObject.id
        );
        if (!parentAssignedUri) {
          throw new Error(
            `[ElementConverterHandler]: Unable to find the assigned URI for parent of class (${object.path}).`
          );
        }

        const referencedEntitiesGraph = this.df.namedNode('referencedEntities');

        this.addDefinitions(
          parentClassObject,
          parentInternalId,
          referencedEntitiesGraph,
          quads
        );

        this.addLabels(
          parentClassObject,
          parentInternalId,
          referencedEntitiesGraph,
          quads
        );

        this.addUsageNotes(
          parentClassObject,
          parentInternalId,
          referencedEntitiesGraph,
          quads
        );

        quads.push(
          this.df.quad(
            parentInternalId,
            ns.rdf('type'),
            ns.owl('Class'),
            referencedEntitiesGraph
          ),
          this.df.quad(
            parentInternalId,
            ns.oslo('assignedURI'),
            this.df.namedNode(parentAssignedUri.toString()),
            referencedEntitiesGraph
          )
        );
      }
    });

    return quads;
  }

  private getCodelistQuads(
    object: EaElement,
    objectInternalId: RDF.NamedNode
  ): RDF.Quad[] {
    const quads: RDF.Quad[] = [];

    // Get codelist information via "ap-codelist" tag
    const codelistUri = getTagValue(object, TagNames.ApCodelist, null);

    if (codelistUri) {
      quads.push(
        this.df.quad(
          objectInternalId,
          ns.oslo('codelist'),
          this.df.namedNode(codelistUri)
        )
      );
    }

    return quads;
  }
}
