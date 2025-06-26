import type { IConfiguration, YargsParams } from '@oslo-flanders/core';
import { injectable } from 'inversify';

@injectable()
export class StakeholdersConversionServiceConfiguration
  implements IConfiguration
{
  /**
   * Local path or URL to an OSLO stakeholders csv file
   */
  private _input: string | undefined;

  /**
   * Name of the output file
   */
  private _output: string | undefined;

  /**
   * Format of the output file
   */
  private _outputFormat: string | undefined;

  /**
   * Name of the contributors column
   */
  private _contributorsColumn: string | undefined;

  /**
   * IRI of the specification document
   */
  private _iri: string | undefined;

  public async createFromCli(params: YargsParams): Promise<void> {
    this._input = <string>params.input;
    this._output = <string>params.output;
    this._outputFormat = <string>params.outputFormat;
    this._contributorsColumn = <string>params.contributorsColumn;
    this._iri = <string>params.iri;
  }

  public get input(): string {
    if (!this._input) {
      throw new Error(`Trying to access property "input" before it was set.`);
    }
    return this._input;
  }

  public get output(): string {
    if (!this._output) {
      throw new Error(`Trying to access property "output" before it was set.`);
    }
    return this._output;
  }

  public get outputFormat(): string {
    if (!this._outputFormat) {
      throw new Error(
        `Trying to access property "outputFormat" before it was set.`,
      );
    }
    return this._outputFormat;
  }

  public get contributorsColumn(): string {
    if (!this._contributorsColumn) {
      throw new Error(
        `Trying to access property "contributorsColumn" before it was set.`,
      );
    }
    return this._contributorsColumn;
  }

  public get iri(): string {
    if (!this._iri) {
      throw new Error(`Trying to access property "iri" before it was set.`);
    }
    return this._iri;
  }
}
