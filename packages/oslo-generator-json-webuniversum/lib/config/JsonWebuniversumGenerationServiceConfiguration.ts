import type { IConfiguration, YargsParams } from '@oslo-flanders/core';
import { injectable } from 'inversify';

@injectable()
export class JsonWebuniversumGenerationServiceConfiguration
  implements IConfiguration
{
  /**
   * Local path or URL to (OSLO compliant) RDF file to generate JSON Webuniversum config from
   */
  private _input: string | undefined;

  /**
   * Local path to write the JSON Webuniversum config to
   */
  private _output: string | undefined;

  /**
   * The language of the values that must be used in the config
   */
  private _language: string | undefined;

  /**
   * Boolean that indicated if filters should be applied on the generated output
   */

  private _applyFiltering: boolean | undefined;

  public async createFromCli(params: YargsParams): Promise<void> {
    this._input = <string>params.input;
    this._output = <string>params.output;
    this._language = <string>params.language;
    this._applyFiltering = <boolean>params.applyFiltering;
  }

  public get input(): string {
    if (!this._input) {
      throw new Error('Trying to access "input" before it was set.');
    }
    return this._input;
  }

  public get output(): string {
    if (!this._output) {
      throw new Error('Trying to access "output" before it was set.');
    }
    return this._output;
  }

  public get language(): string {
    if (!this._language) {
      throw new Error('Trying to access "language" before it was set.');
    }
    return this._language;
  }

  public get applyFiltering(): boolean {
    return !!this._applyFiltering;
  }
}
