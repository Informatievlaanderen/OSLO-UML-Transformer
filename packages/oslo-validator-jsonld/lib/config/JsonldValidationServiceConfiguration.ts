import type { IConfiguration, YargsParams } from '@oslo-flanders/core';
import { injectable } from 'inversify';

@injectable()
export class JsonldValidationServiceConfiguration implements IConfiguration {
  /**
   * Local path or URL to JSON-LD file to validate
   */
  private _input: string | undefined;

  /**
   * Local path or URL to whitelist file (JSON array of URI prefixes)
   */
  private _whitelist: string | undefined;

  /**
   * The base URI of the environment where the document will be published
   */
  private _publicationEnvironment: string | undefined;

  public async createFromCli(params: YargsParams): Promise<void> {
    this._input = <string>params.input;
    this._whitelist = <string>params.whitelist;
    this._publicationEnvironment = <string>params.publicationEnvironment;
  }

  public get input(): string {
    if (!this._input) {
      throw new Error(`Trying to access property "input" before it was set.`);
    }
    return this._input;
  }

  public get whitelist(): string | undefined {
    return this._whitelist;
  }

  public get publicationEnvironment(): string {
    if (!this._publicationEnvironment) {
      throw new Error(
        `Trying to access property "publicationEnvironment" before it was set.`
      );
    }
    return this._publicationEnvironment;
  }
}
