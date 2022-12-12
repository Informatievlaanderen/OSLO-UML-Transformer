import type { IConfiguration, YargsParams } from '@oslo-flanders/core';
import { injectable } from 'inversify';

@injectable()
export class EaUmlConverterConfiguration implements IConfiguration {
  /**
   * Local path or URL to a EAP file.
   */
  private _umlFile: string | undefined;

  /**
   * The name of the diagram within the EAP file.
   */
  private _diagramName: string | undefined;

  /**
   * Type of the specification for the intermediary RDF (JSON-LD) file.
   * Mainly used to extract the correct labels from tags in the UML diagram
   * Possible values are "ApplicationProfile" or "Vocabulary"
   */
  private _specificationType: string | undefined;

  /**
   * Name of the RDF output file
   */
  private _outputFile: string | undefined;

  /**
   * Version id for the RDF document
   */
  private _versionId: string | undefined;

  /**
   * Base URI used for the version id in the RDF document
   */
  private _baseUri: string | undefined;

  /**
   * An RDF serialisation
   */
  private _outputFormat: string | undefined;

  public async createFromCli(params: YargsParams): Promise<void> {
    this._umlFile = <string>params.umlFile;
    this._diagramName = <string>params.diagramName;
    this._specificationType = <string>params.specificationType;
    this._outputFile = <string>(params.outputFile || 'report.jsonld');
    this._versionId = <string>params.versionId;
    this._baseUri = <string>params.baseUri;
    this._outputFormat = params.outputFormat ? <string>params.outputFormat : undefined;
  }

  public get umlFile(): string {
    if (!this._umlFile) {
      throw new Error(`Trying to access property "umlFile" before it was set.`);
    }
    return this._umlFile;
  }

  public get diagramName(): string {
    if (!this._diagramName) {
      throw new Error(`Trying to access property "diagramName" before it was set.`);
    }
    return this._diagramName;
  }

  public get specificationType(): string {
    if (!this._specificationType) {
      throw new Error(`Trying to access property "specificationType" before it was set.`);
    }
    return this._specificationType;
  }

  public get outputFile(): string {
    if (!this._outputFile) {
      throw new Error(`Trying to access property "outputFile" before it was set.`);
    }
    return this._outputFile;
  }

  public get versionId(): string {
    if (!this._versionId) {
      throw new Error(`Trying to access property "versionId" before it was set.`);
    }
    return this._versionId;
  }

  public get baseUri(): string {
    if (!this._baseUri) {
      throw new Error(`Trying to access property "baseUri" before it was set.`);
    }
    return this._baseUri;
  }

  public get outputFormat(): string {
    if (!this._outputFormat) {
      throw new Error(`Trying to access property "outputFormat" before it was set.`);
    }
    return this._outputFormat;
  }
}
