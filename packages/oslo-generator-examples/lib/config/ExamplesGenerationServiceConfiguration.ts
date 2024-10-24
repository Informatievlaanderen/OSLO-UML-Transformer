import type { IConfiguration, YargsParams } from '@oslo-flanders/core';
import { injectable } from 'inversify';

@injectable()
export class ExamplesGenerationServiceConfiguration implements IConfiguration {
  /**
   * Local path or URL to JSON-LD file to generate examples for
   */
  private _input: string | undefined;

  /**
   * Local path to write examp;e files to
   */
  private _output: string | undefined;

  /**
   * Language for which the examples must be generated
   */
  private _language: string | undefined;

  /**
   * the public base url on which the context of the jsons are published
   */
  private _contextBase: string | undefined;

  public async createFromCli(params: YargsParams): Promise<void> {
    this._input = <string>params.input;
    this._output = <string>params.output;
    this._contextBase = <string>params.contextbase;
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

  public get contextBase(): string {
    if (!this._contextBase) {
      throw new Error(`Trying to access property "contextBase" before it was set.`);
    }
    return this._contextBase;
  }

  public get language(): string {
    if (!this._language) {
      throw new Error(
        `Trying to access property "language" before it was set.`,
      );
    }
    return this._language;
  }
}
