import { fetchFileOrUrl } from "@oslo-flanders/core";
import MDBReader from 'mdb-reader';
import { EaAttribute } from "./types/EaAttribute";
import { EaConnector } from "./types/EaConnector";
import { EaDiagram } from "./types/EaDiagram";
import { EaElement } from "./types/EaElement";
import { EaPackage } from "./types/EaPackage";
import { loadAttributes } from "./utils/loadAttributes";
import { loadDiagrams } from "./utils/loadDiagrams";
import { loadElementConnectors } from "./utils/loadElementConnectors";
import { loadElements } from "./utils/loadElements";
import { loadPackages } from "./utils/loadPackage";

export class DataRegistry {
  private _diagrams: EaDiagram[] | undefined;
  private _packages: EaPackage[] | undefined;
  private _attributes: EaAttribute[] | undefined;
  private _elements: EaElement[] | undefined;
  private _connectors: EaConnector[] | undefined;

  public async extract(umlFile: string): Promise<void> {
    const buffer = await fetchFileOrUrl(umlFile);
    const mdb = new MDBReader(buffer);

    loadPackages(mdb, this);
    loadElements(mdb, this);
    loadAttributes(mdb, this);
    loadElementConnectors(mdb, this);
    loadDiagrams(mdb, this);
  }

  public get diagrams(): EaDiagram[] {
    if (!this._diagrams) {
      throw new Error(`Trying to access diagrams before they were loaded.`)
    }
    return this._diagrams;
  }

  public set diagrams(value: EaDiagram[]) {
    this._diagrams = value;
  }

  public get packages(): EaPackage[] {
    if (!this._packages) {
      throw new Error(`Trying to access packages before they were loaded.`)
    }
    return this._packages;
  }

  public set packages(value: EaPackage[]) {
    this._packages = value;
  }

  public get attributes(): EaAttribute[] {
    if (!this._attributes) {
      throw new Error(`Trying to access attributes before they were loaded.`)
    }
    return this._attributes;
  }

  public set attributes(value: EaAttribute[]) {
    this._attributes = value;
  }

  public get elements(): EaElement[] {
    if (!this._elements) {
      throw new Error(`Trying to access elements before they were loaded.`)
    }
    return this._elements;
  }

  public set elements(value: EaElement[]) {
    this._elements = value;
  }

  public get connectors(): EaConnector[] {
    if (!this._connectors) {
      throw new Error(`Trying to access connectors before they were loaded.`)
    }
    return this._connectors;
  }

  public set connectors(value: EaConnector[]) {
    this._connectors = value;
  }
}
