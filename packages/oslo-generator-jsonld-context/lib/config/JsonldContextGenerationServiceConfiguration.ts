import type { IConfiguration, YargsParams } from '@oslo-flanders/core';
import { injectable } from 'inversify';

@injectable()
export class JsonldContextGenerationServiceConfiguration implements IConfiguration {
  /**
   * Local path or URL to (OSLO compliant) RDF file to generate JSON-LD context from
   */
  private _input: string | undefined;

  /**
 * Local path to write the JSON-LD context to
 */
  private _output: string | undefined;

  /**
 * The language of the labels that are used in the context
 */
  private _language: string | undefined;

  /**
   * Add domain name to every property as prefix (disambiguation)
   */
  private _addDomainPrefix: boolean | undefined;

  public async createFromCli(params: YargsParams): Promise<void> {
    this._input = <string>params.input;
    this._output = <string>params.output;
    this._addDomainPrefix = <boolean>params.addDomainPrefix;
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

  public get language(): string {
    if (!this._language) {
      throw new Error(`Trying to access property "language" before it was set.`);
    }
    return this._language;
  }

  public get addDomainPrefix(): boolean {
    if (this._addDomainPrefix === undefined) {
      throw new Error(`Trying to access property "addDomainPrefix" before it was set.`);
    }
    return this._addDomainPrefix;
  }
}
