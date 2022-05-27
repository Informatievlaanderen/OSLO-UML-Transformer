import { fetchFileOrUrl, getLoggerFor } from '@oslo-flanders/core';
import MDBReader from 'mdb-reader';
import { loadAttributes } from './AttributeLoader';
import { loadDiagrams } from './DiagramLoader';
import { loadElementConnectors } from './ElementConnectorLoader';
import { loadElements } from './ElementLoader';
import { EaTable } from './enums/EaTable';
import { loadPackages } from './PackageLoader';
import type { EaAttribute } from './types/EaAttribute';
import type { EaConnector } from './types/EaConnector';
import type { EaDiagram } from './types/EaDiagram';
import type { EaElement } from './types/EaElement';
import type { EaPackage } from './types/EaPackage';
import { addEaTagsToElements } from './utils/tags';

export class UmlDataExtractor {
  private readonly logger = getLoggerFor(this);

  private _packages: EaPackage[] | undefined;
  private _attributes: EaAttribute[] | undefined;
  private _elements: EaElement[] | undefined;
  private _connectors: EaConnector[] | undefined;
  private _diagrams: EaDiagram[] | undefined;

  private _targetDiagram: EaDiagram | undefined;

  public async extractData(file: string): Promise<void> {
    this.logger.info(`Start extraction data from ${file}`);

    const buffer = await fetchFileOrUrl(file);
    const eaReader = new MDBReader(buffer);

    this.packages = loadPackages(eaReader);
    this.elements = loadElements(eaReader, this.packages);

    // Object tags contains tags for packages and elements.
    // If tags are added in the load function, then warnings are logged because one is not present
    const objectTags = eaReader.getTable(EaTable.ClassAndPackageTag).getData();
    addEaTagsToElements(objectTags, [...this.packages, ...this.elements], 'Object_ID', 'Value');

    this.attributes = loadAttributes(eaReader, this.elements);
    this.connectors = loadElementConnectors(eaReader, this.elements);
    this.diagrams = loadDiagrams(eaReader, this.connectors, this.packages);

    this.logger.info('Done extracting data');
  }

  public setTargetDiagram(name: string): void {
    const filteredDiagrams = this.diagrams.filter(x => x.name === name);

    if (filteredDiagrams.length > 1) {
      throw new Error(`Multiple diagrams share the same name '${name}'. Aborting conversion.`);
    }

    if (filteredDiagrams.length === 0) {
      throw new Error(`UML model does not contain a diagram with name ${name}.`);
    }

    this.targetDiagram = filteredDiagrams[0];
  }

  public get attributes(): EaAttribute[] {
    if (!this._attributes) {
      throw new Error('Attributes have not been extracted yet.');
    }
    return this._attributes;
  }

  public set attributes(value: EaAttribute[]) {
    this._attributes = value;
  }

  public get elements(): EaElement[] {
    if (!this._elements) {
      throw new Error('Elements have not been extracted yet.');
    }
    return this._elements;
  }

  public set elements(value: EaElement[]) {
    this._elements = value;
  }

  public get packages(): EaPackage[] {
    if (!this._packages) {
      throw new Error('Packages have not been extracted yet.');
    }
    return this._packages;
  }

  public set packages(value: EaPackage[]) {
    this._packages = value;
  }

  public get connectors(): EaConnector[] {
    if (!this._connectors) {
      throw new Error('Connectors have not been extracted yet.');
    }
    return this._connectors;
  }

  public set connectors(value: EaConnector[]) {
    this._connectors = value;
  }

  public get diagrams(): EaDiagram[] {
    if (!this._diagrams) {
      throw new Error('Diagrams have not been extracted yet.');
    }
    return this._diagrams;
  }

  public set diagrams(value: EaDiagram[]) {
    this._diagrams = value;
  }

  public get targetDiagram(): EaDiagram {
    if (!this._targetDiagram) {
      throw new Error('Target diagram has not been set yet.');
    }
    return this._targetDiagram;
  }

  public set targetDiagram(value: EaDiagram) {
    this._targetDiagram = value;
  }
}
