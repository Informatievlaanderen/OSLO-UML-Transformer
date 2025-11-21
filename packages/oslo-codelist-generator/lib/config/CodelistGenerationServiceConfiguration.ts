import type { IConfiguration, YargsParams } from '@oslo-flanders/core';
import { injectable } from 'inversify';

@injectable()
export class CodelistGenerationServiceConfiguration implements IConfiguration {
  /**
   * URL or local path to a CSV file containing codelist data
   */
  private _input: string | undefined;

  /**
   * Local path to write the output file to
   */
  private _output: string | undefined;

  /**
   * Language for the codelist labels and definitions
   */
  private _language: string | undefined;

  /**
   * Name of the column containing label values
   */
  private _labelColumn: string | undefined;

  /**
   * Name of the column containing definition values
   */
  private _definitionColumn: string | undefined;

  /**
   * Name of the column containing notation values
   */
  private _notationColumn: string | undefined;

  /**
   * Name of the column containing narrower concept references
   */
  private _narrowerColumn: string | undefined;

  /**
   * Name of the column containing broader concept references
   */
  private _broaderColumn: string | undefined;

  /**
   * Name of the column containing status information
   */
  private _statusColumn: string | undefined;

  /**
   * Name of the column containing dataset information
   */
  private _datasetColumn: string | undefined;

  public async createFromCli(params: YargsParams): Promise<void> {
    this._input = <string>params.input;
    this._output = <string>params.output;
    this._language = <string>params.language;
    this._labelColumn = <string>params.labelColumn;
    this._definitionColumn = <string>params.definitionColumn;
    this._notationColumn = <string>params.notationColumn;
    this._narrowerColumn = <string>params.narrowerColumn;
    this._broaderColumn = <string>params.broaderColumn;
    this._statusColumn = <string>params.statusColumn;
    this._datasetColumn = <string>params.datasetColumn;
  }

  public get input(): string {
    if (!this._input) {
      throw new Error('Trying to access property "input" before it was set.');
    }
    return this._input;
  }

  public get output(): string {
    if (!this._output) {
      throw new Error('Trying to access property "output" before it was set.');
    }
    return this._output;
  }

  public get language(): string {
    if (!this._language) {
      throw new Error(
        'Trying to access property "language" before it was set.',
      );
    }
    return this._language;
  }

  public get labelColumn(): string {
    if (!this._labelColumn) {
      throw new Error(
        'Trying to access property "labelColumn" before it was set.',
      );
    }
    return this._labelColumn;
  }

  public get definitionColumn(): string {
    if (!this._definitionColumn) {
      throw new Error(
        'Trying to access property "definitionColumn" before it was set.',
      );
    }
    return this._definitionColumn;
  }

  public get notationColumn(): string {
    if (!this._notationColumn) {
      throw new Error(
        'Trying to access property "notationColumn" before it was set.',
      );
    }
    return this._notationColumn;
  }

  public get narrowerColumn(): string {
    if (!this._narrowerColumn) {
      throw new Error(
        'Trying to access property "narrowerColumn" before it was set.',
      );
    }
    return this._narrowerColumn;
  }

  public get broaderColumn(): string {
    if (!this._broaderColumn) {
      throw new Error(
        'Trying to access property "broaderColumn" before it was set.',
      );
    }
    return this._broaderColumn;
  }

  public get statusColumn(): string {
    if (!this._statusColumn) {
      throw new Error(
        'Trying to access property "statusColumn" before it was set.',
      );
    }
    return this._statusColumn;
  }

  public get datasetColumn(): string {
    if (!this._datasetColumn) {
      throw new Error(
        'Trying to access property "datasetColumn" before it was set.',
      );
    }
    return this._datasetColumn;
  }
}
