import type { IConfiguration, YargsParams } from '@oslo-flanders/core';
import { injectable } from 'inversify';

@injectable()
export class JsonldValidationServiceConfiguration implements IConfiguration {
  /**
   * Local path or URL to JSON-LD file to validate
   */
  private _input: string | undefined;

  /**
   * The base URI of the environment where the document will be published
   */
  private _publicationEnvironment: string | undefined;

  /**
   * Local path or URL to whitelist file (JSON array of URI prefixes)
   */
  private _whitelist: string | undefined;

  /**
   * Type of document
   */
  private _specificationType: string | undefined;

  /**
   * The language in which intermediary format is generated
   */
  private _language: string | undefined;

  public async createFromCli(params: YargsParams): Promise<void> {
    this._input = <string>params.input;
    this._publicationEnvironment = <string>params.publicationEnvironment;
    this._whitelist = <string>params.whitelist;
    this._specificationType = <string>params.specificationType;
    this._language = <string>params.language
  }

  public get input(): string {
    if (!this._input) {
      throw new Error(
        `Trying to access property "input" before it was set.`,
      );
    }
    return this._input;
  }

  public get whitelist(): string | undefined {
    if (!this._whitelist) {
      throw new Error(
        `Trying to access property "whitelist" before it was set.`,
      );
    }
    return this._whitelist;
  }

  public get specificationType(): string | undefined {
    if (!this._specificationType) {
      throw new Error(
        `Trying to access property "specificationType" before it was set.`,
      );
    }
    return this._specificationType;
  }

  public get publicationEnvironment(): string {
    if (!this._publicationEnvironment) {
      throw new Error(
        `Trying to access property "publicationEnvironment" before it was set.`,
      );
    }
    return this._publicationEnvironment;
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

