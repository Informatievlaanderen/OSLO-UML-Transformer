import { IConfiguration, YargsParams } from '@oslo-flanders/core';
import { injectable } from 'inversify';

@injectable()
export class HtmlWebcomponentsV2GenerationServiceConfiguration
  implements IConfiguration
{
  /**
   * Local path or URL to (OSLO compliant) RDF file to generate HTML page from
   */
  private _input: string | undefined;

  /**
   * Local path to write the HTML page to
   */
  private _output: string | undefined;

  /**
   * The language to extract the label from the OSLO JSON-LD file
   */
  private _language: string | undefined;

  private _specificationType: string | undefined;

  public async createFromCli(params: YargsParams): Promise<void> {
    this._input = <string>params.input;
    this._output = <string>params.output;
    this._specificationType = <string>params.specificationType;
    this._language = <string>params.language;
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

  public get specificationType(): string {
    if (!this._specificationType) {
      throw new Error(
        `Trying to access property "specificationType" before it was set.`
      );
    }
    return this._specificationType;
  }

  public get language(): string {
    if (!this._language) {
      throw new Error(
        `Trying to access property "language" before it was set.`
      );
    }
    return this._language;
  }
}
