import type { IConfiguration, YargsParams } from '@oslo-flanders/core';
import { SpecificationType } from '@oslo-flanders/core';
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

  /**
   * The base URI of the environment where the document will be published
   */
  private _publicationEnvironment: string | undefined;

  /**
   * The specification that must be generated: an application profile
   * or vocabulary.
   */
  private _specificationType: SpecificationType | undefined;

  /**
   * Whether to propagate properties from parent classes to their children
   */
  private _propagateParentProperties: boolean | undefined;

  public async createFromCli(params: YargsParams): Promise<void> {
    this._input = <string>params.input;
    this._output = <string>params.output;
    this._language = <string>params.language;
    this._applyFiltering = <boolean>params.applyFiltering;
    this._publicationEnvironment = <string>params.publicationEnvironment;
    this._specificationType = this.getSpecificationType(
      <string>params.specificationType,
    );
    this._propagateParentProperties = <boolean>params.propagateParentProperties;
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

  public get publicationEnvironment(): string {
    if (!this._publicationEnvironment) {
      throw new Error(
        `Trying to access property "publicationEnvironment" before it was set.`,
      );
    }
    return this._publicationEnvironment;
  }

  public get specificationType(): SpecificationType {
    if (this._specificationType === undefined) {
      throw new Error(
        `Trying to access property "specificationType" before it was set.`,
      );
    }
    return this._specificationType;
  }

  private getSpecificationType(value: string): SpecificationType {
    switch (value) {
      case 'Vocabulary':
        return SpecificationType.Vocabulary;

      case 'ApplicationProfile':
        return SpecificationType.ApplicationProfile;

      default:
        throw new Error(
          `Unable to translate ${value} to a specification type.`,
        );
    }
  }

  public get propagateParentProperties(): boolean {
    return !!this._propagateParentProperties;
  }
}
