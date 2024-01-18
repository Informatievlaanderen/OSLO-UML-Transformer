import type { Logger } from '@oslo-flanders/core';
import { fetchFileOrUrl } from '@oslo-flanders/core';
import MDBReader from 'mdb-reader';
import type { EaAttribute } from '@oslo-extractor-uml-ea/types/EaAttribute';
import type { EaConnector } from '@oslo-extractor-uml-ea/types/EaConnector';
import type { EaDiagram } from '@oslo-extractor-uml-ea/types/EaDiagram';
import type { EaElement } from '@oslo-extractor-uml-ea/types/EaElement';
import type { EaPackage } from '@oslo-extractor-uml-ea/types/EaPackage';
import type { NormalizedConnector } from '@oslo-extractor-uml-ea/types/NormalizedConnector';
import { loadAttributes } from '@oslo-extractor-uml-ea/utils/loadAttributes';
import { loadDiagrams } from '@oslo-extractor-uml-ea/utils/loadDiagrams';
import { loadElementConnectors } from '@oslo-extractor-uml-ea/utils/loadElementConnectors';
import { loadElements } from '@oslo-extractor-uml-ea/utils/loadElements';
import { loadPackages } from '@oslo-extractor-uml-ea/utils/loadPackage';

export class DataRegistry {
  public readonly logger: Logger;

  public constructor(logger: Logger) {
    this.logger = logger;
  }

  private _diagrams: EaDiagram[] | undefined;
  private _packages: EaPackage[] | undefined;
  private _attributes: EaAttribute[] | undefined;
  private _elements: EaElement[] | undefined;
  private _connectors: EaConnector[] | undefined;
  private _normalizedConnectors: NormalizedConnector[] | undefined;
  private _targetDiagram: EaDiagram | undefined;

  public async extract(umlFile: string): Promise<void> {
    const buffer = await fetchFileOrUrl(umlFile);
    const mdb = new MDBReader(buffer);

    loadPackages(mdb, this);
    loadElements(mdb, this);
    loadAttributes(mdb, this);
    loadElementConnectors(mdb, this);
    loadDiagrams(mdb, this);
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

  public get targetDiagram(): EaDiagram {
    if (!this._targetDiagram) {
      throw new Error(`Trying to access targetDiagram before it was set.`);
    }
    return this._targetDiagram;
  }

  public set targetDiagram(value: EaDiagram) {
    if (this._targetDiagram) {
      throw new Error(`TargetDiagram was already set.`);
    }
    this._targetDiagram = value;
  }

  public get diagrams(): EaDiagram[] {
    if (!this._diagrams) {
      throw new Error(`Trying to access diagrams before they were loaded.`);
    }
    return this._diagrams;
  }

  public set diagrams(value: EaDiagram[]) {
    this._diagrams = value;
  }

  public get packages(): EaPackage[] {
    if (!this._packages) {
      throw new Error(`Trying to access packages before they were loaded.`);
    }
    return this._packages;
  }

  public set packages(value: EaPackage[]) {
    this._packages = value;
  }

  public get attributes(): EaAttribute[] {
    if (!this._attributes) {
      throw new Error(`Trying to access attributes before they were loaded.`);
    }
    return this._attributes;
  }

  public set attributes(value: EaAttribute[]) {
    this._attributes = value;
  }

  public get elements(): EaElement[] {
    if (!this._elements) {
      throw new Error(`Trying to access elements before they were loaded.`);
    }
    return this._elements;
  }

  public set elements(value: EaElement[]) {
    this._elements = value;
  }

  public get connectors(): EaConnector[] {
    if (!this._connectors) {
      throw new Error(`Trying to access connectors before they were loaded.`);
    }
    return this._connectors;
  }

  public set connectors(value: EaConnector[]) {
    this._connectors = value;
  }

  public get normalizedConnectors(): NormalizedConnector[] {
    if (!this._normalizedConnectors) {
      throw new Error(`Trying to access normalized connectors before they were loaded.`);
    }
    return this._normalizedConnectors;
  }

  public set normalizedConnectors(value: NormalizedConnector[]) {
    this._normalizedConnectors = value;
  }
}
