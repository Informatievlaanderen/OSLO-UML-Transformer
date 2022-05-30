import { getLoggerFor } from '@oslo-flanders/core';
import type { EaAttribute, EaDiagram, EaElement, EaPackage } from '@oslo-flanders/ea-uml-extractor';
import { ConnectorType, ElementType } from '@oslo-flanders/ea-uml-extractor';
import { TagName } from './enums/TagName';
import type { NormalizedConnector } from './types/NormalizedConnector';

import { CasingType, convertToCase, extractUri, getTagValue } from './utils/utils';

// FIXME: discuss what we should do with this
const backupBaseUri = 'https://fixme.com#';

export class UriAssigner {
  public readonly logger = getLoggerFor(this);

  // Package id mapped to a URI
  public readonly packageIdUriMap: Map<number, string>;

  // Package id mapped to ontology URI
  public readonly packageIdOntologyUriMap: Map<number, string>;

  // Element id mapped to a URI
  public readonly elementIdUriMap: Map<number, string>;

  // Attribute id mapped to a URI
  public readonly attributeIdUriMap: Map<number, string>;

  // Package name mapped to package object
  public readonly packageNameToPackageMap: Map<string, EaPackage[]>;

  // Element name mapped to element object
  public readonly elementNameToElementMap: Map<string, EaElement[]>;

  // Connector id mapped to a URI
  public readonly connectorIdUriMap: Map<number, string>;

  public constructor() {
    this.packageIdUriMap = new Map();
    this.packageIdOntologyUriMap = new Map();
    this.elementIdUriMap = new Map();
    this.attributeIdUriMap = new Map();
    this.packageNameToPackageMap = new Map();
    this.elementNameToElementMap = new Map();
    this.connectorIdUriMap = new Map();
  }

  public async assignUris(
    diagram: EaDiagram,
    packages: EaPackage[],
    elements: EaElement[],
    attributes: EaAttribute[],
    connectors: NormalizedConnector[],
  ): Promise<void> {
    packages.forEach(_package =>
      this.packageNameToPackageMap
        .set(_package.name, [...this.packageNameToPackageMap.get(_package.name) || [], _package]));

    this.assignUrisToPackages(packages);

    await Promise.all([
      this.assignUrisToElements(elements),
      this.assignUrisToAttributes(attributes, elements),
      this.assignConnectorUris(diagram, connectors, elements),
    ]);
  }

  public assignUrisToPackages(packages: EaPackage[]): void {
    packages.forEach(_package => {
      const packageUri = getTagValue(_package, TagName.PackageBaseUri, backupBaseUri, true);
      const namespace = packageUri.slice(0, -1);
      const ontologyURI = getTagValue(_package, TagName.PackageOntologyUri, namespace, true);

      this.packageIdUriMap.set(_package.packageId, packageUri);
      this.packageIdOntologyUriMap.set(_package.packageId, ontologyURI);
    });
  }

  public async assignUrisToElements(elements: EaElement[]): Promise<void> {
    elements.forEach(element => {
      const packageUri = this.packageIdUriMap.get(element.packageId);

      if (!packageUri) {
        this.logger.error(`Unnable to find the package URI for element (${element.path}) with package id '${element.packageId}', skipping it.`);
        return;
      }

      const packageNameTag = getTagValue(element, TagName.DefiningPackage, null);
      let elementPackageUri = packageUri;

      if (packageNameTag) {
        elementPackageUri = this.getDefininingPackageUri(packageNameTag, elementPackageUri);
      }

      const extractedUri = extractUri(element, elementPackageUri, CasingType.PascalCase);
      this.elementIdUriMap.set(element.id, extractedUri);
      this.elementNameToElementMap.set(
        element.name,
        [...this.elementNameToElementMap.get(element.name) || [], element],
      );
    });
  }

  public async assignUrisToAttributes(attributes: EaAttribute[], elements: EaElement[]): Promise<void> {
    attributes.forEach(attribute => {
      const attributeClass = elements.find(x => x.id === attribute.classId);

      if (!attributeClass) {
        this.logger.error(`Unnable to find the class object to which the attribute (${attribute.path}) belongs, skipping attribute.`);
        return;
      }

      const packageUri = this.packageIdUriMap.get(attributeClass.packageId);

      if (!packageUri) {
        this.logger.error(`Unnable to find the package URI for attribute (${attribute.path}) with package id '${attributeClass.packageId}', skipping it.`);
        return;
      }

      const packageNameTag = getTagValue(attribute, TagName.DefiningPackage, null);
      let attributePackageUri = packageUri;

      if (packageNameTag) {
        attributePackageUri = this.getDefininingPackageUri(packageNameTag, attributePackageUri);
      }

      if (attributeClass.type === ElementType.Enumeration) {
        let namespace = attributePackageUri;

        if (namespace.endsWith('/') || namespace.endsWith('#')) {
          namespace = namespace.slice(0, Math.max(0, namespace.length - 1));
        }

        let localName = getTagValue(attributeClass, TagName.LocalName, attributeClass.name);
        localName = convertToCase(localName);

        const instanceNamespace = `${namespace}/${localName}/`;
        const attributeUri = extractUri(attribute, instanceNamespace, CasingType.CamelCase);
        this.attributeIdUriMap.set(attribute.id, attributeUri);
      } else {
        const uri = extractUri(attribute, attributePackageUri, CasingType.CamelCase);
        this.attributeIdUriMap.set(attribute.id, uri);
      }
    });
  }

  public async assignConnectorUris(
    diagram: EaDiagram,
    connectors: NormalizedConnector[],
    elements: EaElement[],
  ): Promise<void> {
    const diagramConnectors: NormalizedConnector[] = [];

    diagram.connectorsIds.forEach(connectorId => {
      const filteredConnectors = connectors.filter(x => x.innerConnectorId === connectorId) || [];
      diagramConnectors.push(...filteredConnectors);
    });

    diagramConnectors.forEach(connector => {
      // Inheritance related connectors do not get an URI.
      if (connector.innerConnectorType === ConnectorType.Generalization) {
        return;
      }

      let connectorUri = getTagValue(connector, TagName.ExternalUri, null);
      const packageName = getTagValue(connector, TagName.DefiningPackage, null);
      const connectorPackages = this.packageNameToPackageMap.get(packageName);
      let definingPackageUri: string | null = null;

      // Here, we check the value of the 'package' tag.
      // If there was no value, both source and destination must be defined in the same package.
      // If there was a value, we check that the same package name is used for different packages,
      // (otherwise we log a warning)
      if (!connectorPackages || connectorPackages.length === 0) {
        const sourcePackageId = elements.find(x => x.id === connector.sourceObjectId)!.packageId;
        const destinationPackageId = elements.find(x => x.id === connector.destinationObjectId)!.packageId;

        if (sourcePackageId === destinationPackageId) {
          this.logger.info(`Assuming connector (${connector.path}) belongs to package (${sourcePackageId}) based on source and target definition.`);
          definingPackageUri = this.packageIdUriMap.get(sourcePackageId)!;
        }
      } else {
        if (connectorPackages.length > 1) {
          this.logger.warn(`Ambiguous package "${packageName}" name specified for connector (${connector.path}).`);
        }
        definingPackageUri = this.packageIdUriMap.get(connectorPackages[0].packageId)!;
      }

      // If there is no value for the 'uri' tag
      if (!connectorUri) {
        // Then the connector must somehow receive a value through the 'package' tag
        if (!definingPackageUri) {
          this.logger.warn(`Ignoring connector (${connector.path}) as it lacks a defining package or is defined on a non-existing package.`);
          return;
        }

        let localName = getTagValue(connector, TagName.LocalName, null);

        if (!localName) {
          this.logger.warn(`Connector (${connector.path}) does not have a name and will be ignored.`);
          return;
        }

        localName = convertToCase(localName);
        connectorUri = definingPackageUri + localName;
      }

      // This.logger.info(`Connector (${connector.path()}) was assigned the following URI: '${connectorUri}'.`);
      this.connectorIdUriMap.set(connector.id, connectorUri);
    });
  }

  private getDefininingPackageUri(packageName: string, currentPackageUri: string): string {
    const referencedPackages = this.packageNameToPackageMap.get(packageName) || [];

    if (referencedPackages.length === 0) {
      this.logger.warn(`Specified package '${packageName}' was not found. Returning ${currentPackageUri}`);
      return currentPackageUri;
    }

    if (referencedPackages.length > 1) {
      this.logger.warn(`Ambiguous package name "${packageName}" found.`);
    }

    return this.packageIdUriMap.get(referencedPackages[0].packageId)!;
  }
}
