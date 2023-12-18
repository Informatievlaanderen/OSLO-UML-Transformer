import { URL } from 'url';
import { PropertyType, QuadStore } from '@oslo-flanders/core';
import { ns } from '@oslo-flanders/core';
import type {
  DataRegistry,
  EaAttribute,
  EaElement,
} from '@oslo-flanders/ea-uml-extractor';
import { ElementType } from '@oslo-flanders/ea-uml-extractor';
import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import { EaUmlConverterConfiguration } from '../config/EaUmlConverterConfiguration';
import { EaUmlConverterServiceIdentifier } from '../config/EaUmlConverterServiceIdentifier';
import { CasingTypes } from '../enums/CasingTypes';
import { DataTypes, datatypeIdentifierToHash } from '../enums/DataTypes';
import { TagNames } from '../enums/TagNames';
import { ConverterHandler } from '../interfaces/ConverterHandler';
import type { UriRegistry } from '../UriRegistry';
import { getTagValue, ignore, toCamelCase } from '../utils/utils';

@injectable()
export class AttributeConverterHandler extends ConverterHandler<EaAttribute> {
  @inject(EaUmlConverterServiceIdentifier.Configuration)
  public readonly config!: EaUmlConverterConfiguration;

  public async filterIgnoredObjects(
    model: DataRegistry
  ): Promise<DataRegistry> {
    model.attributes = model.attributes.filter((x) => !ignore(x));

    return model;
  }

  public async convert(
    model: DataRegistry,
    uriRegistry: UriRegistry,
    store: QuadStore
  ): Promise<QuadStore> {
    // Only attributes of elements that are on the target diagram will be passed to the output handler
    // and attributes that have a domain that is not an enumeration
    const enumerationClasses = model.elements.filter(
      (x) => x.type === ElementType.Enumeration
    );
    model.attributes
      .filter(
        (x) =>
          model.targetDiagram.elementIds.includes(x.classId) &&
          !enumerationClasses.some((y) => y.id === x.classId)
      )
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
    uriRegistry.attributeIdUriMap = new Map<number, URL>();

    model.attributes.forEach((attribute) => {
      const attributeClass = model.elements.find(
        (x) => x.id === attribute.classId
      );

      if (!attributeClass) {
        throw new Error(
          `[AttributeConverterHandler]: Unable to find domain object for attribute (${attribute.path}).`
        );
      }

      // We do not process attributes of enumerations
      if (attributeClass.type === ElementType.Enumeration) {
        return;
      }

      const externalUri = getTagValue(attribute, TagNames.ExternalUri, null);
      if (externalUri) {
        uriRegistry.attributeIdUriMap.set(attribute.id, new URL(externalUri));
      }

      let attributeBaseURI: string | undefined;
      const packageTagValue = getTagValue(
        attribute,
        TagNames.DefiningPackage,
        null
      );

      if (packageTagValue) {
        const packageObjects =
          uriRegistry.packageNameToPackageMap.get(packageTagValue);

        if (!packageObjects) {
          throw new Error(
            `[AttributeConverterHandler]: Package tag was defined, but unable to find a related package object for attribute (${attribute.path}).`
          );
        }

        if (packageObjects.length > 1) {
          this.logger.warn(
            `[AttributeConverterHandler]: Multiple packages discovered through name tag "${packageTagValue}" for attribute (${attribute.path}).`
          );
        }

        const packageURI = uriRegistry.packageIdUriMap.get(
          packageObjects[0].packageId
        );
        if (!packageURI) {
          throw new Error(
            `[AttributeConverterHandler]: Unable to find the URI of package (${packageObjects[0].parent}), but is needed as base URI.`
          );
        }
        attributeBaseURI = packageURI.toString();
      } else {
        const packageURI = uriRegistry.packageIdUriMap.get(
          attributeClass.packageId
        );

        if (!packageURI) {
          throw new Error(
            `[AttributeConverterHandler]: Unable to determine the package of attribute (${attribute.path}).`
          );
        }

        attributeBaseURI = packageURI.toString();
      }

      let localName = getTagValue(
        attribute,
        TagNames.LocalName,
        attribute.name
      );
      localName = toCamelCase(localName);

      const attributeURI = new URL(`${attributeBaseURI}${localName}`);
      uriRegistry.attributeIdUriMap.set(attribute.id, attributeURI);
    });

    return uriRegistry;
  }

  public createQuads(
    object: EaAttribute,
    uriRegistry: UriRegistry,
    model: DataRegistry
  ): RDF.Quad[] {
    const quads: RDF.Quad[] = [];
    const attributeInternalId = this.df.namedNode(
      `${this.baseUrnScheme}:${object.osloGuid}`
    );
    const attributeUri = uriRegistry.attributeIdUriMap.get(object.id);

    if (!attributeUri) {
      throw new Error(
        `[AttributeConverterHandler]: Unable to find URI for attribute (${object.path}).`
      );
    }

    const attributeUriNamedNode = this.df.namedNode(attributeUri.toString());

    quads.push(
      this.df.quad(
        attributeInternalId,
        ns.oslo('assignedURI'),
        attributeUriNamedNode
      )
    );

    // Adding definitions, labels and usage notes
    this.addEntityInformation(object, attributeInternalId, quads);

    const packageBaseUri = uriRegistry.packageIdUriMap.get(
      model.targetDiagram.packageId
    );

    if (!packageBaseUri) {
      throw new Error(
        `[AttributeCOnverterHandler]: Unable to find the URI for the package in which the target diagram (${model.targetDiagram.name}) was placed.`
      );
    }

    this.addScope(
      object,
      attributeInternalId,
      packageBaseUri.toString(),
      uriRegistry.attributeIdUriMap,
      quads
    );

    // Determining the domain
    const domainClass = model.elements.find((x) => x.id === object.classId);
    if (!domainClass) {
      throw new Error(
        `[AttributeConverterHandler]: Unable to find the domain of attribute (${object.path}).`
      );
    }

    const domainInternalId = this.df.namedNode(
      `${this.baseUrnScheme}:${domainClass.osloGuid}`
    );

    quads.push(
      this.df.quad(attributeInternalId, ns.rdfs('domain'), domainInternalId)
    );

    // Determining the range
    let rangeURI = getTagValue(object, TagNames.Range, null);
    let attributeType: PropertyType;

    if (rangeURI) {
      const rangeIsLiteral = getTagValue(object, TagNames.IsLiteral, false);
      attributeType =
        rangeIsLiteral === 'true'
          ? PropertyType.DataTypeProperty
          : PropertyType.ObjectProperty;
    } else {
      const rangeLabel = object.type;
      attributeType = PropertyType.Property;

      const rangeElement = model.elements.find((x) => x.name === rangeLabel);

      if (rangeElement) {
        const rangeIsLiteral = getTagValue(
          rangeElement,
          TagNames.IsLiteral,
          false
        );
        attributeType =
          rangeIsLiteral === 'true'
            ? PropertyType.DataTypeProperty
            : PropertyType.ObjectProperty;
        rangeURI = `${this.baseUrnScheme}:${rangeElement.osloGuid}`;

        if (!model.targetDiagram.elementIds.includes(rangeElement.id)) {
          quads.push(
            ...this.getElementInformationQuads(
              this.df.namedNode(rangeURI),
              uriRegistry,
              rangeElement
            )
          );
        }
      } else if (DataTypes.has(rangeLabel)) {
        attributeType = PropertyType.DataTypeProperty;
        const rangeAssignedURI = DataTypes.get(rangeLabel)!;
        rangeURI = `${this.baseUrnScheme}:${datatypeIdentifierToHash(
          rangeAssignedURI
        )}`;

        quads.push(
          ...this.getDatatypeQuads(
            this.df.namedNode(rangeURI),
            this.df.namedNode(rangeAssignedURI),
            rangeLabel
          )
        );
      }
    }

    if (!rangeURI) {
      throw new Error(
        `[AttributeConverterHandler]: Unable to get the URI for the range of attribute (${object.path}).`
      );
    }

    quads.push(
      this.df.quad(
        attributeInternalId,
        ns.rdfs('range'),
        this.df.namedNode(rangeURI)
      ),
      this.df.quad(
        attributeInternalId,
        ns.rdf('type'),
        this.df.namedNode(attributeType)
      ),
      this.df.quad(
        attributeInternalId,
        ns.shacl('minCount'),
        this.df.literal(object.lowerBound)
      ),
      this.df.quad(
        attributeInternalId,
        ns.shacl('maxCount'),
        this.df.literal(object.upperBound)
      )
    );

    // Add parent information
    const parentURI = getTagValue(object, TagNames.ParentUri, null);
    if (parentURI) {
      quads.push(
        this.df.quad(
          attributeInternalId,
          ns.rdfs('subPropertyOf'),
          this.df.namedNode(parentURI)
        )
      );
    }

    // Add codelist information
    const codelistURI = getTagValue(object, TagNames.ApCodelist, null);
    if(codelistURI) {
      quads.push(
        this.df.quad(
          attributeInternalId,
          ns.oslo('codelist'),
          this.df.namedNode(codelistURI)
        )
      )
    }

    return quads;
  }

  private getDatatypeQuads(
    rangeInternalId: RDF.NamedNode,
    rangeAssignedURI: RDF.NamedNode,
    rangeLabel: string
  ): RDF.Quad[] {
    const quads: RDF.Quad[] = [];

    quads.push(
      this.df.quad(rangeInternalId, ns.rdf('type'), ns.rdfs('Datatype')),
      this.df.quad(rangeInternalId, ns.oslo('assignedURI'), rangeAssignedURI),
      this.df.quad(
        rangeInternalId,
        ns.oslo('diagramLabel'),
        this.df.literal(rangeLabel)
      )
    );

    return quads;
  }

  private getElementInformationQuads(
    rangeInternalId: RDF.NamedNode,
    uriRegistry: UriRegistry,
    rangeElement: EaElement
  ): RDF.Quad[] {
    const quads: RDF.Quad[] = [];
    const referencedEntitiesGraph = this.df.namedNode('referencedEntities');

    // TODO: switch to this.addEntityInformation?
    this.addDefinitions(
      <any>rangeElement,
      rangeInternalId,
      referencedEntitiesGraph,
      quads
    );
    this.addLabels(
      <any>rangeElement,
      rangeInternalId,
      referencedEntitiesGraph,
      quads
    );
    this.addUsageNotes(
      <any>rangeElement,
      rangeInternalId,
      referencedEntitiesGraph,
      quads
    );

    const assignedUri = uriRegistry.elementIdUriMap.get(rangeElement.id);
    if (!assignedUri) {
      throw new Error(
        `[AttributeConverterHandler]: Unable to find the assigned URI for the range (${rangeElement.path}) of attribute.`
      );
    }

    quads.push(
      this.df.quad(
        rangeInternalId,
        ns.oslo('assignedURI'),
        this.df.namedNode(assignedUri.toString()),
        referencedEntitiesGraph
      )
    );

    const skosCodelist = getTagValue(rangeElement, TagNames.ApCodelist, null);
    if (skosCodelist) {
      quads.push(
        this.df.quad(
          rangeInternalId,
          ns.oslo('codelist'),
          this.df.namedNode(skosCodelist),
          referencedEntitiesGraph
        )
      );
    }

    return quads;
  }
}
