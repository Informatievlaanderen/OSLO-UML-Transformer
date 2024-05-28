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
   * Name of the RDF output file
   */
  private _outputFile: string | undefined;

  /**
   * Version id for the RDF document
   */
  private _versionId: string | undefined;

  /**
   * An RDF serialisation
   */
  private _outputFormat: string | undefined;

  /**
   * The base URI of the environment where the document will be published
   */
  private _publicationEnvironment: string | undefined;

  /**
   * The format of the input file, AccessDB or SQLite
   */
  private _inputFormat: string | undefined

  public async createFromCli(params: YargsParams): Promise<void> {
    this._umlFile = <string>params.umlFile;
    this._diagramName = <string>params.diagramName;
    this._outputFile = <string>(params.outputFile || 'report.jsonld');
    this._versionId = <string>params.versionId;
    this._outputFormat = <string>params.outputFormat;
    this._publicationEnvironment = <string>params.publicationEnvironment;
    this._inputFormat = <string>params.inputFormat;
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

  public get outputFormat(): string {
    if (!this._outputFormat) {
      throw new Error(`Trying to access property "outputFormat" before it was set.`);
    }
    return this._outputFormat;
  }

  public get publicationEnvironment(): string {
    if (!this._publicationEnvironment) {
      throw new Error(`Trying to access property "publicationEnvironment" before it was set.`);
    }
    return this._publicationEnvironment;
  }

  public get inputFormat(): string {
    if (!this._inputFormat) {
      throw new Error(`Trying to access property "inputFormat" before it was set.`);
    }
    return this._inputFormat;
  }
}
