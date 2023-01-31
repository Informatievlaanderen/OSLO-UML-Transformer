import { ns } from '@oslo-flanders/core';
import type { DataRegistry, EaConnector, EaElement, EaTag } from '@oslo-flanders/ea-uml-extractor';
import { ConnectorType, NormalizedConnector, NormalizedConnectorTypes } from '@oslo-flanders/ea-uml-extractor';
import type * as RDF from '@rdfjs/types';
import { injectable } from 'inversify';
import type * as N3 from 'n3';
import { TagNames } from '../enums/TagNames';
import { ConverterHandler } from '../interfaces/ConverterHandler';
import type { UriRegistry } from '../UriRegistry';
import { convertToCase, getTagValue, ignore } from '../utils/utils';

@injectable()
export class ConnectorConverterHandler extends ConverterHandler<NormalizedConnector> {
  public async filterIgnoredObjects(model: DataRegistry): Promise<DataRegistry> {
    model.connectors = model.connectors.filter(x => !ignore(x));

    return model;
  }

  public async convert(model: DataRegistry, uriRegistry: UriRegistry, store: RDF.Store): Promise<RDF.Store> {
    model.normalizedConnectors
      .filter(x => model.targetDiagram.connectorsIds.includes(x.originalId))
      .forEach(object => (<N3.Store>store).addQuads(this.createQuads(object, uriRegistry, model)));

    return store;
  }

  public async normalize(model: DataRegistry): Promise<DataRegistry> {
    model.normalizedConnectors = model.connectors
      .filter(x => model.targetDiagram.connectorsIds.includes(x.id))
      .flatMap(x => this.normalizeConnector(x, model.elements));

    return model;
  }

  public async assignUris(model: DataRegistry, uriRegistry: UriRegistry): Promise<UriRegistry> {
    uriRegistry.connectorOsloIdUriMap = new Map<number, URL>();
    const diagramConnectors: NormalizedConnector[] = [];

    model.targetDiagram.connectorsIds.forEach(connectorId => {
      const filteredConnectors = model.normalizedConnectors.filter(x => x.originalId === connectorId) || [];
      diagramConnectors.push(...filteredConnectors);
    });

    diagramConnectors.forEach(connector => {
      // Inheritance related connectors do not get an URI.
      if (connector.originalType === ConnectorType.Generalization) {
        return;
      }

      let connectorUri = getTagValue(connector, TagNames.ExternalUri, null);
      const packageName = getTagValue(connector, TagNames.DefiningPackage, null);
      let definingPackageUri: URL | undefined;

      // Here, we check the value of the 'package' tag.
      // If there was no value, both source and destination must be defined in the same package.
      // If there was a value, we check that the same package name is used for different packages,
      // (otherwise we log a warning)
      if (!packageName) {
        const sourcePackageId = model.elements.find(x => x.id === connector.sourceObjectId)!.packageId;
        const destinationPackageId = model.elements.find(x => x.id === connector.destinationObjectId)!.packageId;

        if (sourcePackageId === destinationPackageId) {
          definingPackageUri = uriRegistry.packageIdUriMap.get(sourcePackageId)!;
        }
      } else {
        const packageObject = model.packages.find(x => x.name === packageName);
        if (!packageObject) {
          throw new Error(`Unable to find package for name "${packageName}".`);
        }

        definingPackageUri = new URL(uriRegistry.packageIdUriMap.get(packageObject.packageId)!);
      }

      // If there is no value for the 'uri' tag
      if (!connectorUri) {
        // Then the connector must somehow receive a value through the 'package' tag
        if (!definingPackageUri) {
          // TODO: log message
          return;
        }

        let localName = getTagValue(connector, TagNames.LocalName, null);

        if (!localName) {
          // TODO: log message
          return;
        }

        localName = convertToCase(localName);
        connectorUri = `${definingPackageUri}${localName}`;
      }

      uriRegistry.connectorOsloIdUriMap.set(connector.id, new URL(connectorUri));
    });

    return uriRegistry;
  }

  public createQuads(object: NormalizedConnector, uriRegistry: UriRegistry, model: DataRegistry): RDF.Quad[] {
    const quads: RDF.Quad[] = [];

    const connectorUri = uriRegistry.connectorOsloIdUriMap.get(object.id);

    if (!connectorUri) {
      throw new Error(`Connector with EA guid ${object.eaGuid} has no URI assigned.`);
    }

    const connectorUriNamedNode = this.df.namedNode(connectorUri.toString());
    quads.push(this.df.quad(connectorUriNamedNode, ns.rdf('type'), ns.owl('ObjectProperty')));

    const definitionValues = this.getDefinition(object);
    definitionValues.forEach(x => quads.push(this.df.quad(connectorUriNamedNode, ns.rdfs('comment'), x)));

    const labelValues = this.getLabel(object);
    labelValues.forEach(x => quads.push(this.df.quad(connectorUriNamedNode, ns.rdfs('label'), x)));

    const usageNoteValues = this.getUsageNote(object);
    usageNoteValues.forEach(x => quads.push(this.df.quad(connectorUriNamedNode, ns.vann('usageNote'), x)));

    const domainObject = model.elements.find(x => x.id === object.sourceObjectId);

    if (domainObject) {
      const domainUri = uriRegistry.elementIdUriMap.get(domainObject.id);

      if (!domainUri) {
        throw new Error(`No URI was found for element with EA guid ${domainObject.eaGuid} 
        while assigning the domain for connector with EA guid ${object.eaGuid}`);
      }

      const domainUriNamedNode = this.df.namedNode(domainUri.toString());
      quads.push(this.df.quad(
        connectorUriNamedNode,
        ns.rdfs('domain'),
        domainUriNamedNode,
      ));
    }

    const rangeObject = model.elements.find(x => x.id === object.destinationObjectId);

    if (rangeObject) {
      const rangeUri = uriRegistry.elementIdUriMap.get(rangeObject.id);

      if (!rangeUri) {
        throw new Error(`No URI was found for element with EA guid ${rangeObject.eaGuid} 
        while assigning the range for connector with EA guid ${object.eaGuid}`);
      }

      const rangeUriNamedNode = this.df.namedNode(rangeUri.toString());
      quads.push(this.df.quad(
        connectorUriNamedNode,
        ns.rdfs('range'),
        rangeUriNamedNode,
      ));
    }

    const packageBaseUri = uriRegistry.packageIdUriMap.get(model.targetDiagram.packageId);

    if (!packageBaseUri) {
      throw new Error(`Unnable to find URI for the package (EA guid: ${model.targetDiagram.eaGuid}) containing the target diagram when converting EaAttributes.`);
    }

    const scope = this.getScope(object, packageBaseUri.toString(), uriRegistry.connectorOsloIdUriMap);
    quads.push(this.df.quad(
      connectorUriNamedNode,
      ns.example('scope'),
      this.df.namedNode(scope),
    ));

    let minCardinality;
    let maxCardinality;

    if (object.cardinality.includes('..')) {
      [minCardinality, maxCardinality] = object.cardinality.split('..');
    } else {
      minCardinality = maxCardinality = object.cardinality;
    }

    quads.push(
      this.df.quad(
        connectorUriNamedNode,
        ns.shacl('minCount'),
        this.df.literal(minCardinality),
      ),
      this.df.quad(
        connectorUriNamedNode,
        ns.shacl('maxCount'),
        this.df.literal(maxCardinality),
      ),
    );

    const parentUri = getTagValue(object, TagNames.ParentUri, null);
    if (parentUri) {
      quads.push(
        this.df.quad(
          connectorUriNamedNode,
          ns.rdfs('subPropertyOf'),
          this.df.namedNode(parentUri),
        ),
      );
    }

    return quads;
  }

  // TODO: for connector with multiple cardinalities, uri should be disambiguated with class name
  private normalizeConnector(connector: EaConnector, elements: EaElement[]): NormalizedConnector[] {
    const normalizedConnectors: NormalizedConnector[] = [];

    if (connector.type === ConnectorType.Generalization) {
      return [];
    }

    if (connector.sourceRole && connector.sourceRole !== '') {
      normalizedConnectors.push(this.createNormalizedConnector(
        connector,
        connector.sourceRole,
        connector.destinationObjectId,
        connector.sourceObjectId,
        connector.sourceCardinality,
        connector.sourceRoleTags,
      ));
    }

    if (connector.destinationRole && connector.destinationRole !== '') {
      normalizedConnectors.push(this.createNormalizedConnector(
        connector,
        connector.destinationRole,
        connector.sourceObjectId,
        connector.destinationObjectId,
        connector.destinationCardinality,
        connector.destinationRoleTags,
      ));
    }

    if (connector.name && connector.name !== '') {
      if (connector.sourceCardinality &&
        connector.sourceCardinality !== '' &&
        connector.destinationCardinality &&
        connector.destinationCardinality !== '') {
        const sourceObjectName = elements.find(x => x.id === connector.sourceObjectId)!.name;
        const destinationObjectName = elements.find(x => x.id === connector.destinationObjectId)!.name;

        normalizedConnectors.push(this.createNormalizedConnector(
          connector,
          `${sourceObjectName}.${connector.name}`,
          connector.destinationObjectId,
          connector.sourceObjectId,
          connector.sourceCardinality,
          connector.tags,
        ));

        normalizedConnectors.push(this.createNormalizedConnector(
          connector,
          `${destinationObjectName}.${connector.name}`,
          connector.sourceObjectId,
          connector.destinationObjectId,
          connector.destinationCardinality,
          connector.tags,
        ));
      } else {
        if (connector.sourceCardinality && connector.sourceCardinality !== '') {
          normalizedConnectors.push(this.createNormalizedConnector(
            connector,
            connector.name,
            connector.destinationObjectId,
            connector.sourceObjectId,
            connector.sourceCardinality,
            connector.tags,
          ));
        }

        if (connector.destinationCardinality && connector.destinationCardinality !== '') {
          normalizedConnectors.push(this.createNormalizedConnector(
            connector,
            connector.name,
            connector.sourceObjectId,
            connector.destinationObjectId,
            connector.destinationCardinality,
            connector.tags,
          ));
        }
      }
    }

    if (connector.associationClassId) {
      normalizedConnectors.push(...this.createNormalizedAssociationClassConnector(connector, elements));
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
    tags: EaTag[],
  ): NormalizedConnector {
    return new NormalizedConnector(
      connector,
      name,
      sourceObjectId,
      destinationObjectId,
      cardinality,
      tags,
    );
  }

  private createNormalizedAssociationClassConnector(
    connector: EaConnector,
    elements: EaElement[],
  ): NormalizedConnector[] {
    const sourceObject = elements.find(x => x.id === connector.sourceObjectId);
    const destinationObject = elements.find(x => x.id === connector.destinationObjectId);

    if (!sourceObject || !destinationObject) {
      // Log error
      return [];
    }

    const assocationObject = elements.find(x => x.id === connector.associationClassId);

    if (!assocationObject) {
      // TODO: log message or throw error
      return [];
    }

    let sourceObjectIdentifier = `${assocationObject.name}.${convertToCase(sourceObject.name)}`;
    let destinationObjectIdentifier = `${assocationObject.name}.${convertToCase(destinationObject.name)}`;

    let sourceLabel: string = sourceObjectIdentifier;
    let destinationLabel: string = destinationObjectIdentifier;

    // In case of a self-association
    if (connector.sourceObjectId === connector.destinationObjectId) {
      sourceObjectIdentifier = `${sourceObjectIdentifier}.source`;
      destinationObjectIdentifier = `${destinationObjectIdentifier}.target`;
      sourceLabel = `${sourceLabel} (source)`;
      destinationLabel = `${destinationLabel} (target)`;
    }

    sourceLabel = getTagValue(
      assocationObject,
      this.config.specificationType === 'ApplicationProfile' ?
        TagNames.AssociationSourceApLabel :
        TagNames.AssociationSourceLabel,
      null,
    ) || sourceLabel;

    destinationLabel = getTagValue(
      assocationObject,
      this.config.specificationType === 'ApplicationProfile' ?
        TagNames.AssociationTargetApLabel :
        TagNames.AssociationTargetLabel,
      null,
    ) || destinationLabel;

    const sourceConnectorTags: EaTag[] = [{
      id: Date.now(),
      tagName: 'label',
      tagValue: sourceLabel,
    }];

    const sourceUri = getTagValue(assocationObject, TagNames.AssociationSourceUri, null);
    if (sourceUri) {
      sourceConnectorTags.push({
        id: Date.now(),
        tagName: 'uri',
        tagValue: sourceUri,
      });
    }

    const destinationConnectorTags: EaTag[] = [{
      id: Date.now(),
      tagName: 'label',
      tagValue: destinationLabel,
    }];

    const destinationUri = getTagValue(assocationObject, TagNames.AssociationTargetUri, null);
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
        NormalizedConnectorTypes.AssociationClassConnector,
      ),
      new NormalizedConnector(
        connector,
        destinationObjectIdentifier,
        connector.associationClassId!,
        connector.destinationObjectId,
        '1',
        destinationConnectorTags,
        NormalizedConnectorTypes.AssociationClassConnector,
      ),
    ];
  }
}
