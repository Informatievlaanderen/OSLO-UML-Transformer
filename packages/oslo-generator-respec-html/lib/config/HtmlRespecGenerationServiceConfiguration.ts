import type { IConfiguration, YargsParams } from '@oslo-flanders/core';
import { injectable } from 'inversify';
import { SpecificationType } from '../utils/specificationTypeEnum';

@injectable()
export class HtmlRespecGenerationServiceConfiguration implements IConfiguration {
  /**
   * Local path or URL to JSON-LD file to generate ReSpec HTML document from
   */
  private _input: string | undefined;

  /**
   * Local path to write HTML file to
   */
  private _output: string | undefined;

  /**
   * The language of the labels that are used in the context
   */
  private _language: string | undefined;

  /**
   * The specification that must be generated: an application profile
   * or vocabulary.
   */
  private _specificationType: SpecificationType | undefined;

  /**
   * Name of the specification
   */
  private _specificationName: string | undefined;

  public async createFromCli(params: YargsParams): Promise<void> {
    this._input = <string>params.input;
    this._output = <string>params.output;
    this._language = <string>params.language;
    this._specificationType = this.getSpecificationType(<string>params.specificationType);
    this._specificationName = <string>params.specificationName;
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

  public get specificationType(): SpecificationType {
    if (this._specificationType === undefined) {
      throw new Error(`Trying to access property "specificationType" before it was set.`);
    }
    return this._specificationType;
  }

  public get specificationName(): string {
    if (!this._specificationName) {
      throw new Error(
        `Trying to access property "specificationName" before it was set.`,
      );
    }
    return this._specificationName;
  }

  private getSpecificationType(value: string): SpecificationType {
    switch (value) {
      case 'Vocabulary':
        return SpecificationType.Vocabulary;

      case 'ApplicationProfile':
        return SpecificationType.ApplicationProfile;

      default:
        throw new Error(`Unable to translate ${value} to a specification type.`);
    }
  }
}
