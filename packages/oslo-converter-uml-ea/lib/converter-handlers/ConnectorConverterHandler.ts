import type { QuadStore } from '@oslo-flanders/core';
import { ns } from '@oslo-flanders/core';
import type {
  DataRegistry,
  EaConnector,
  EaElement,
  EaTag,
} from '@oslo-flanders/ea-uml-extractor';
import {
  ConnectorType,
  NormalizedConnector,
  NormalizedConnectorTypes,
} from '@oslo-flanders/ea-uml-extractor';
import type * as RDF from '@rdfjs/types';
import { injectable } from 'inversify';
import { TagNames } from '../enums/TagNames';
import { ConverterHandler } from '../interfaces/ConverterHandler';
import type { UriRegistry } from '../UriRegistry';
import { convertToCase, getTagValue, ignore } from '../utils/utils';

@injectable()
export class ConnectorConverterHandler extends ConverterHandler<NormalizedConnector> {
  public async filterIgnoredObjects(
    model: DataRegistry
  ): Promise<DataRegistry> {
    model.connectors = model.connectors.filter((x) => !ignore(x));

    return model;
  }

  public async convert(
    model: DataRegistry,
    uriRegistry: UriRegistry,
    store: QuadStore
  ): Promise<QuadStore> {
    model.normalizedConnectors
      .filter((x) => model.targetDiagram.connectorsIds.includes(x.originalId))
      .forEach((object) =>
        store.addQuads(this.createQuads(object, uriRegistry, model))
      );

    return store;
  }

  public async normalize(model: DataRegistry): Promise<DataRegistry> {
    model.normalizedConnectors = model.connectors
      .filter((x) => model.targetDiagram.connectorsIds.includes(x.id))
      .flatMap((x) => this.normalizeConnector(x, model.elements));

    return model;
  }

  public async assignUris(
    model: DataRegistry,
    uriRegistry: UriRegistry
  ): Promise<UriRegistry> {
    uriRegistry.connectorOsloIdUriMap = new Map<number, URL>();
    const diagramConnectors: NormalizedConnector[] = [];

    model.targetDiagram.connectorsIds.forEach((connectorId) => {
      const filteredConnectors =
        model.normalizedConnectors.filter(
          (x) => x.originalId === connectorId
        ) || [];
      diagramConnectors.push(...filteredConnectors);
    });

    diagramConnectors.forEach((connector) => {
      // Inheritance related connectors do not get an URI.
      if (connector.originalType === ConnectorType.Generalization) {
        return;
      }

      const externalUri = getTagValue(connector, TagNames.ExternalUri, null);
      if (externalUri) {
        uriRegistry.connectorOsloIdUriMap.set(
          connector.id,
          new URL(externalUri)
        );
        return;
      }

      const packageTagValue = getTagValue(
        connector,
        TagNames.DefiningPackage,
        null
      );
      let baseUri: string | undefined;
      if (packageTagValue) {
        const packageObject = model.packages.find(
          (x) => x.name === packageTagValue
        );

        if (!packageObject) {
          throw new Error(
            `[ConnectorConverterHandler]: Unable to find package for name "${packageTagValue}".`
          );
        }

        const packageUri = uriRegistry.packageIdUriMap.get(
          packageObject.packageId
        );
        if (!packageUri) {
          throw new Error(
            `[ConnectorConverterHandler]: Unable to find the URI for package (${packageObject.path}).`
          );
        }

        baseUri = packageUri.toString();
      } else {
        const sourcePackage = model.elements.find(
          (x) => x.id === connector.sourceObjectId
        );
        const destinationPackage = model.elements.find(
          (x) => x.id === connector.destinationObjectId
        );

        if (
          sourcePackage &&
          destinationPackage &&
          sourcePackage.packageId === destinationPackage.packageId
        ) {
          baseUri = uriRegistry.packageIdUriMap
            .get(sourcePackage.packageId)!
            .toString();
        } else {
          this.logger.warn(
            `[ConnectorConverterHandler]: Can not determine the correct base URI for connector (${connector.path}) and the fallback URI (${uriRegistry.fallbackBaseUri}) will be assigned.`
          );
          baseUri = uriRegistry.fallbackBaseUri;
        }
      }

      let localName = getTagValue(
        connector,
        TagNames.LocalName,
        connector.name
      );
      localName = convertToCase(localName);
      const connectorUri = new URL(`${baseUri}${localName}`);
      uriRegistry.connectorOsloIdUriMap.set(
        connector.id,
        connectorUri
      );
    });

    return uriRegistry;
  }

  public createQuads(
    object: NormalizedConnector,
    uriRegistry: UriRegistry,
    model: DataRegistry
  ): RDF.Quad[] {
    const quads: RDF.Quad[] = [];

    const connectorInternalId = this.df.namedNode(
      `${this.baseUrnScheme}:${object.osloGuid}`
    );
    const connectorUri = uriRegistry.connectorOsloIdUriMap.get(object.id);

    if (!connectorUri) {
      throw new Error(
        `[ConnectorConverterHandler]: Unable to find URI for connector (${object.path})`
      );
    }

    const connectorUriNamedNode = this.df.namedNode(connectorUri.toString());

    quads.push(
      this.df.quad(
        connectorInternalId,
        ns.rdf('type'),
        ns.owl('ObjectProperty')
      ),
      this.df.quad(
        connectorInternalId,
        ns.oslo('assignedURI'),
        connectorUriNamedNode
      )
    );

    // Adding definitions, labels and usage notes
    this.addEntityInformation(object, connectorInternalId, quads);

    /*this.addDefinitions(
      object,
      connectorInternalId,
      this.df.defaultGraph(),
      quads
    );
    this.addLabels(object, connectorInternalId, this.df.defaultGraph(), quads);
    this.addUsageNotes(
      object,
      connectorInternalId,
      this.df.defaultGraph(),
      quads
    );*/

    const domainObject = model.elements.find(
      (x) => x.id === object.sourceObjectId
    );

    if (domainObject) {
      const domainInternalId = this.df.namedNode(
        `${this.baseUrnScheme}:${domainObject.osloGuid}`
      );
      quads.push(
        this.df.quad(connectorInternalId, ns.rdfs('domain'), domainInternalId)
      );
    }

    const rangeObject = model.elements.find(
      (x) => x.id === object.destinationObjectId
    );

    if (rangeObject) {
      const rangeInternalId = this.df.namedNode(
        `${this.baseUrnScheme}:${rangeObject.osloGuid}`
      );

      quads.push(
        this.df.quad(connectorInternalId, ns.rdfs('range'), rangeInternalId)
      );
    }

    const packageBaseUri = uriRegistry.packageIdUriMap.get(
      model.targetDiagram.packageId
    );

    if (!packageBaseUri) {
      throw new Error(
        `[ConnectorConverterHandler]: Unnable to find URI for the package in which the target diagram (${model.targetDiagram.name}) was placed.`
      );
    }

    this.addScope(
      object,
      connectorInternalId,
      packageBaseUri.toString(),
      uriRegistry.connectorOsloIdUriMap,
      quads
    );

    let minCardinality;
    let maxCardinality;

    if (object.cardinality) {
      if (object.cardinality.includes('..')) {
        [minCardinality, maxCardinality] = object.cardinality.split('..');
      } else {
        minCardinality = maxCardinality = object.cardinality;
      }

      quads.push(
        this.df.quad(
          connectorInternalId,
          ns.shacl('minCount'),
          this.df.literal(minCardinality)
        ),
        this.df.quad(
          connectorInternalId,
          ns.shacl('maxCount'),
          this.df.literal(maxCardinality)
        )
      );
    } else {
      this.logger.warn(
        `[ConnectorConverterHandler]: Unable to determine cardinality for connector (${object.path}).`
      );
    }

    const parentUri = getTagValue(object, TagNames.ParentUri, null);
    if (parentUri) {
      quads.push(
        this.df.quad(
          connectorInternalId,
          ns.rdfs('subPropertyOf'),
          this.df.namedNode(parentUri)
        )
      );
    }

    return quads;
  }

  // TODO: for connector with multiple cardinalities, uri should be disambiguated with class name
  private normalizeConnector(
    connector: EaConnector,
    elements: EaElement[]
  ): NormalizedConnector[] {
    const normalizedConnectors: NormalizedConnector[] = [];

    if (connector.type === ConnectorType.Generalization) {
      return [];
    }

    if (connector.sourceRole && connector.sourceRole !== '') {
      normalizedConnectors.push(
        this.createNormalizedConnector(
          connector,
          connector.sourceRole,
          connector.destinationObjectId,
          connector.sourceObjectId,
          connector.sourceCardinality,
          connector.sourceRoleTags
        )
      );
    }

    if (connector.destinationRole && connector.destinationRole !== '') {
      normalizedConnectors.push(
        this.createNormalizedConnector(
          connector,
          connector.destinationRole,
          connector.sourceObjectId,
          connector.destinationObjectId,
          connector.destinationCardinality,
          connector.destinationRoleTags
        )
      );
    }

    if (connector.name && connector.name !== '') {
      if (
        connector.sourceCardinality &&
        connector.sourceCardinality !== '' &&
        connector.destinationCardinality &&
        connector.destinationCardinality !== ''
      ) {
        const sourceObjectName = elements.find(
          (x) => x.id === connector.sourceObjectId
        )!.name;
        const destinationObjectName = elements.find(
          (x) => x.id === connector.destinationObjectId
        )!.name;

        normalizedConnectors.push(
          this.createNormalizedConnector(
            connector,
            `${sourceObjectName}.${connector.name}`,
            connector.destinationObjectId,
            connector.sourceObjectId,
            connector.sourceCardinality,
            connector.tags
          )
        );

        normalizedConnectors.push(
          this.createNormalizedConnector(
            connector,
            `${destinationObjectName}.${connector.name}`,
            connector.sourceObjectId,
            connector.destinationObjectId,
            connector.destinationCardinality,
            connector.tags
          )
        );
      } else {
        if (connector.sourceCardinality && connector.sourceCardinality !== '') {
          normalizedConnectors.push(
            this.createNormalizedConnector(
              connector,
              connector.name,
              connector.destinationObjectId,
              connector.sourceObjectId,
              connector.sourceCardinality,
              connector.tags
            )
          );
        }

        if (
          connector.destinationCardinality &&
          connector.destinationCardinality !== ''
        ) {
          normalizedConnectors.push(
            this.createNormalizedConnector(
              connector,
              connector.name,
              connector.sourceObjectId,
              connector.destinationObjectId,
              connector.destinationCardinality,
              connector.tags
            )
          );
        }
      }
    }

    if (connector.associationClassId) {
      normalizedConnectors.push(
        ...this.createNormalizedAssociationClassConnector(connector, elements)
      );
    }

    if (normalizedConnectors.length === 0) {
      // TODO: log message
    }

    return normalizedConnectors;
  }

  private createNormalizedConnector(
    connector: EaConnector,
    name: string,
    sourceObjectId: number,
    destinationObjectId: number,
    cardinality: string,
    tags: EaTag[]
  ): NormalizedConnector {
    return new NormalizedConnector(
      connector,
      name,
      sourceObjectId,
      destinationObjectId,
      cardinality,
      tags
    );
  }

  private createNormalizedAssociationClassConnector(
    connector: EaConnector,
    elements: EaElement[]
  ): NormalizedConnector[] {
    const sourceObject = elements.find(
      (x) => x.id === connector.sourceObjectId
    );
    const destinationObject = elements.find(
      (x) => x.id === connector.destinationObjectId
    );

    if (!sourceObject || !destinationObject) {
      // Log error
      return [];
    }

    const assocationObject = elements.find(
      (x) => x.id === connector.associationClassId
    );

    if (!assocationObject) {
      // TODO: log message or throw error
      return [];
    }

    let sourceObjectIdentifier = `${assocationObject.name}.${convertToCase(
      sourceObject.name
    )}`;
    let destinationObjectIdentifier = `${assocationObject.name}.${convertToCase(
      destinationObject.name
    )}`;

    let sourceLabel: string = sourceObjectIdentifier;
    let destinationLabel: string = destinationObjectIdentifier;

    // In case of a self-association
    if (connector.sourceObjectId === connector.destinationObjectId) {
      sourceObjectIdentifier = `${sourceObjectIdentifier}.source`;
      destinationObjectIdentifier = `${destinationObjectIdentifier}.target`;
      sourceLabel = `${sourceLabel} (source)`;
      destinationLabel = `${destinationLabel} (target)`;
    }

    const sourceConnectorTags: EaTag[] = [
      {
        id: Date.now(),
        tagName: 'label',
        tagValue: sourceLabel,
      },
    ];

    const sourceUri = getTagValue(
      assocationObject,
      TagNames.AssociationSourceUri,
      null
    );
    if (sourceUri) {
      sourceConnectorTags.push({
        id: Date.now(),
        tagName: 'uri',
        tagValue: sourceUri,
      });
    }

    const destinationConnectorTags: EaTag[] = [
      {
        id: Date.now(),
        tagName: 'label',
        tagValue: destinationLabel,
      },
    ];

    const destinationUri = getTagValue(
      assocationObject,
      TagNames.AssociationTargetUri,
      null
    );
    if (destinationUri) {
      destinationConnectorTags.push({
        id: Date.now(),
        tagName: 'uri',
        tagValue: destinationUri,
      });
    }

    return [
      new NormalizedConnector(
        connector,
        sourceObjectIdentifier,
        connector.associationClassId!,
        connector.sourceObjectId,
        '1',
        sourceConnectorTags,
        NormalizedConnectorTypes.AssociationClassConnector
      ),
      new NormalizedConnector(
        connector,
        destinationObjectIdentifier,
        connector.associationClassId!,
        connector.destinationObjectId,
        '1',
        destinationConnectorTags,
        NormalizedConnectorTypes.AssociationClassConnector
      ),
    ];
  }
}
