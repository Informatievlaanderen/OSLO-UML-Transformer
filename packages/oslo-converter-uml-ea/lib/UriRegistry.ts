import type { URL } from 'url';
import type { EaElement, EaPackage } from '@oslo-flanders/ea-uml-extractor';

export class UriRegistry {
  /**
   * The fallback base URI
   */
  private readonly _fallbackBaseUri = 'http://todo.com/';

  /**
   * Package id mapped to a URI
   */
  private _packageIdUriMap: Map<number, URL> | undefined;

  /**
   * Package id mapped to ontology URI
   */
  private _packageIdOntologyUriMap: Map<number, URL> | undefined;

  /**
   * Element id mapped to a URI
   */
  private _elementIdUriMap: Map<number, URL> | undefined;

  /**
   * Attribute id mapped to a URI
   */
  private _attributeIdUriMap: Map<number, URL> | undefined;

  /**
   * Package name mapped to package object
   */
  private _packageNameToPackageMap: Map<string, EaPackage[]> | undefined;

  /**
   * Element name mapped to element object
   */
  private _elementNameToElementMap: Map<string, EaElement[]> | undefined;

  /**
   * Connector OSLO id mapped to a URI
   * OSLO guid is necessary to make normalized connectors unique
   */
  private _connectorOsloIdUriMap: Map<number, URL> | undefined;

  public get packageIdUriMap(): Map<number, URL> {
    if (!this._packageIdUriMap) {
      throw new Error(`Trying to access packageIdUri map before it was set.`);
    }
    return this._packageIdUriMap;
  }

  public set packageIdUriMap(value: Map<number, URL>) {
    if (this._packageIdUriMap) {
      throw new Error(`PackageIdUri map was already set.`);
    }
    this._packageIdUriMap = value;
  }

  public get packageIdOntologyUriMap(): Map<number, URL> {
    if (!this._packageIdOntologyUriMap) {
      throw new Error(`Trying to access packageIdOntologyUri map before it was set.`);
    }
    return this._packageIdOntologyUriMap;
  }

  public set packageIdOntologyUriMap(value: Map<number, URL>) {
    if (this._packageIdOntologyUriMap) {
      throw new Error(`PackageIdOntologyUri map was already set.`);
    }
    this._packageIdOntologyUriMap = value;
  }

  public get elementIdUriMap(): Map<number, URL> {
    if (!this._elementIdUriMap) {
      throw new Error(`Trying to access elementIdUri map before it was set.`);
    }
    return this._elementIdUriMap;
  }

  public set elementIdUriMap(value: Map<number, URL>) {
    if (this._elementIdUriMap) {
      throw new Error(`ElementIdUri map was already set.`);
    }
    this._elementIdUriMap = value;
  }

  public get attributeIdUriMap(): Map<number, URL> {
    if (!this._attributeIdUriMap) {
      throw new Error(`Trying to access attributeIdUri map before it was set.`);
    }
    return this._attributeIdUriMap;
  }

  public set attributeIdUriMap(value: Map<number, URL>) {
    if (this._attributeIdUriMap) {
      throw new Error(`AttributeIdUri map was already set.`);
    }
    this._attributeIdUriMap = value;
  }

  public get packageNameToPackageMap(): Map<string, EaPackage[]> {
    if (!this._packageNameToPackageMap) {
      throw new Error(`Trying to access packageNameToPackage map before it was set.`);
    }
    return this._packageNameToPackageMap;
  }

  public set packageNameToPackageMap(value: Map<string, EaPackage[]>) {
    if (this._packageNameToPackageMap) {
      throw new Error(`PackageNameToPackage map was already set.`);
    }
    this._packageNameToPackageMap = value;
  }

  public get elementNameToElementMap(): Map<string, EaElement[]> {
    if (!this._elementNameToElementMap) {
      throw new Error(`Trying to access elementNameToElement map before it was set.`);
    }
    return this._elementNameToElementMap;
  }

  public set elementNameToElementMap(value: Map<string, EaElement[]>) {
    if (this._elementNameToElementMap) {
      throw new Error(`ElementNameToElement map was already set.`);
    }
    this._elementNameToElementMap = value;
  }

  public get connectorOsloIdUriMap(): Map<number, URL> {
    if (!this._connectorOsloIdUriMap) {
      throw new Error(`Trying to access connectorIdUri map before it was set.`);
    }
    return this._connectorOsloIdUriMap;
  }

  public set connectorOsloIdUriMap(value: Map<number, URL>) {
    if (this._connectorOsloIdUriMap) {
      throw new Error(`ConnectorIdUri map was already set.`);
    }
    this._connectorOsloIdUriMap = value;
  }

  public get fallbackBaseUri(): string {
    return this._fallbackBaseUri;
  }
}
