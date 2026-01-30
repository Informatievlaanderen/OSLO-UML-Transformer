import type { IConfiguration, YargsParams } from '@oslo-flanders/core';
import { injectable } from 'inversify';

@injectable()
export class RmlGenerationServiceConfiguration implements IConfiguration {
  /**
   * Local path or URL to (OSLO compliant) RDF file to generate JSON-LD context from
   */
  private _input: string | undefined;

  /**
   * Local path or URL to mapping file to generate a RML mapping from
   */
  private _mapping: string | undefined;

  /**
   * Local path to write the JSON-LD context to
   */
  private _output: string | undefined;

  /**
   * The language of the labels that are used in the context
   */
  private _language: string | undefined;

  /**
   * The base IRI to use for the generated RML mappings
   */
  private _baseIRI: string | undefined;

  /**
   * The output format to use for generating RML mappings
   */
  private _outputFormat: string | undefined;


  public async createFromCli(params: YargsParams): Promise<void> {
    this._input = <string>params.input;
    this._mapping = <string>params.mapping;
    this._output = <string>params.output;
    this._language = <string>params.language;
    this._baseIRI = <string>params.baseIRI;
    this._outputFormat = <string>params.outputFormat;
  }

  public get input(): string {
    if (!this._input) {
      throw new Error(`Trying to access property "input" before it was set.`);
    }
    return this._input;
  }

  public get mapping(): string {
    if (!this._mapping) {
      throw new Error(`Trying to access property "mapping" before it was set.`);
    }
    return this._mapping;
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

  public get baseIRI(): string {
    if (!this._baseIRI) {
      throw new Error(`Trying to access property "baseIRI" before it was set.`);
    }
    return this._baseIRI;
  }

  public get outputFormat(): string {
    if (!this._outputFormat) {
      throw new Error(`Trying to access property "outputFormat" before it was set.`);
    }
    return this._outputFormat;
  }
}
