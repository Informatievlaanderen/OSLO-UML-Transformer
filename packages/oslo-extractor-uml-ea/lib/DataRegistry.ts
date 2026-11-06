import type { Logger } from '@oslo-flanders/core';
import type { EaAttribute } from './types/EaAttribute';
import type { EaConnector } from './types/EaConnector';
import type { EaDiagram } from './types/EaDiagram';
import type { EaElement } from './types/EaElement';
import type { EaPackage } from './types/EaPackage';
import type { EaCrossReference } from './types/EaCrossReference';
import type { NormalizedConnector } from './types/NormalizedConnector';
import { combineDiagrams } from './utils/diagramUtils';

export class DataRegistry {
  public readonly logger: Logger;

  public constructor(logger: Logger) {
    this.logger = logger;
    this._crossReferences = [];
  }

  private _diagrams: EaDiagram[] | undefined;
  private _packages: EaPackage[] | undefined;
  private _attributes: EaAttribute[] | undefined;
  private _elements: EaElement[] | undefined;
  private _connectors: EaConnector[] | undefined;
  private _normalizedConnectors: NormalizedConnector[] | undefined;
  private _crossReferences: EaCrossReference[] | undefined;
  private _targetDiagram: EaDiagram | undefined;

  /**
   * Sets the diagram that is converted. Everything on the side diagrams is added
   * to it as if it were drawn on the main diagram. Package and name stay those of
   * the main diagram.
   */
  public setTargetDiagram(name: string, sideDiagramNames: string[] = []): void {
    const mainDiagram = this.findDiagram(name);

    const sideDiagrams = sideDiagramNames
      .filter((sideDiagramName) => {
        if (sideDiagramName === name) {
          this.logger.warn(
            `Side diagram '${sideDiagramName}' is the main diagram itself and is ignored.`,
          );
          return false;
        }
        return true;
      })
      .map((sideDiagramName) => this.findDiagram(sideDiagramName));

    this.targetDiagram =
      sideDiagrams.length > 0
        ? combineDiagrams(mainDiagram, sideDiagrams)
        : mainDiagram;
  }

  private findDiagram(name: string): EaDiagram {
    const filteredDiagrams = this.diagrams.filter((x) => x.name === name);

    if (filteredDiagrams.length > 1) {
      throw new Error(
        `Multiple diagrams share the same name '${name}'. Aborting conversion.`,
      );
    }

    if (filteredDiagrams.length === 0) {
      throw new Error(
        `UML model does not contain a diagram with name ${name}.`,
      );
    }

    return filteredDiagrams[0];
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
      throw new Error(
        `Trying to access normalized connectors before they were loaded.`,
      );
    }
    return this._normalizedConnectors;
  }

  public set normalizedConnectors(value: NormalizedConnector[]) {
    this._normalizedConnectors = value;
  }

  public get crossReferences(): EaCrossReference[] {
    if (!this._crossReferences) {
      throw new Error(
        `Trying to access cross references before they were loaded.`,
      );
    }
    return this._crossReferences;
  }

  public set crossReferences(value: EaCrossReference[]) {
    this._crossReferences = value;
  }
}
