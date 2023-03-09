import type { IConfiguration, YargsParams } from '@oslo-flanders/core';
import { injectable } from 'inversify';

@injectable()
export class StakeholdersConversionServiceConfiguration implements IConfiguration {
  /**
   * Local path or URL to an OSLO stakeholders csv file
   */
  private _input: string | undefined;

  /**
   * Name of the output file
   */
  private _output: string | undefined;

  public async createFromCli(params: YargsParams): Promise<void> {
    this._input = <string>params.input;
    this._output = <string>params.output;
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
}
