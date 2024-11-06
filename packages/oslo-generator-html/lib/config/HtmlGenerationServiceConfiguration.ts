import type { IConfiguration, YargsParams } from '@oslo-flanders/core';
import { SpecificationType } from '@oslo-flanders/core';
import { injectable } from 'inversify';

@injectable()
export class HtmlGenerationServiceConfiguration implements IConfiguration {
  /**
   * Local path or URL to JSON-LD file to generate HTML document from
   */
  private _input: string | undefined;

  /**
   * Local path to write HTML file to
   */
  private _output: string | undefined;

  /**
   * Local path or URL to metadata JSON
   */
  private _metadata: string | undefined;

  /**
   * Local path or URL to JSON of stakeholders
   */
  private _stakeholders: string | undefined;

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

  /**
   * Local path to a folder with custom templates
   */
  private _templates: string | undefined;

  /**
   * Local path to a root template to use if custom templates are provided.
   */
  private _rootTemplate: string | undefined;

  public async createFromCli(params: YargsParams): Promise<void> {
    this._input = <string>params.input;
    this._output = <string>params.output;
    this._stakeholders = <string>params.stakeholders;
    this._metadata = <string>params.metadata;
    this._language = <string>params.language;
    this._templates = <string>params.templates;
    this._rootTemplate = <string>params.rootTemplate;
    this._specificationType = this.getSpecificationType(
      <string>params.specificationType
    );
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

  public get metadata(): string {
    if (!this._metadata) {
      throw new Error(
        `Trying to access property "metadata" before it was set.`
      );
    }
    return this._metadata;
  }

  public get stakeholders(): string {
    if (!this._stakeholders) {
      throw new Error(
        `Trying to access property "stakeholders" before it was set.`
      );
    }
    return this._stakeholders;
  }

  public get language(): string {
    if (!this._language) {
      throw new Error(
        `Trying to access property "language" before it was set.`
      );
    }
    return this._language;
  }

  public get specificationType(): SpecificationType {
    if (this._specificationType === undefined) {
      throw new Error(
        `Trying to access property "specificationType" before it was set.`
      );
    }
    return this._specificationType;
  }

  public get specificationName(): string {
    if (!this._specificationName) {
      throw new Error(
        `Trying to access property "specificationName" before it was set.`
      );
    }
    return this._specificationName;
  }

  public get templates(): string | undefined {
    return this._templates;
  }

  public get rootTemplate(): string | undefined {
    return this._rootTemplate;
  }

  private getSpecificationType(value: string): SpecificationType {
    switch (value) {
      case 'Vocabulary':
        return SpecificationType.Vocabulary;

      case 'ApplicationProfile':
        return SpecificationType.ApplicationProfile;

      default:
        throw new Error(
          `Unable to translate ${value} to a specification type.`
        );
    }
  }
}
