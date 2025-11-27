import type { IConfiguration, YargsParams } from '@oslo-flanders/core';
import { injectable } from 'inversify';

@injectable()
export class SparqlGenerationServiceConfiguration implements IConfiguration {
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
   * SPARQL version
   */
  private _versionSPARQL: string | undefined;

  public async createFromCli(params: YargsParams): Promise<void> {
    this._input = <string>params.input;
    this._output = <string>params.output;
    this._language = <string>params.language;
    this._versionSPARQL = <string>params.versionSPARQL;
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
      throw new Error(
        `Trying to access property "language" before it was set.`,
      );
    }
    return this._language;
  }

  public get versionSPARQL(): string {
    if (!this._versionSPARQL) {
      throw new Error(
        `Trying to access property "versionSPARQL" before it was set.`,
      );
    }
    return this._versionSPARQL;
  }
}
