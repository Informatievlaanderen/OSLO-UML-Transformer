import type { IConfiguration, YargsParams } from '@oslo-flanders/core';
import { OutputFormat } from '@oslo-flanders/core';
import { injectable } from 'inversify';

@injectable()
export class SwaggerGenerationServiceConfiguration implements IConfiguration {
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
   * Swagger version
   */
  private _versionSwagger: string | undefined;

  /**
   * API metadata: version
   */
  private _versionAPI: string | undefined;

  /**
   * API metadata: title
   */
  private _title: string | undefined;

  /**
   * API metadata: description
   */
  private _description: string | undefined;

  /**
   * API metadata: JSON-LD context URL
   */
  private _contextURL: string | undefined;

  /**
   * API metadata: base URL
   */
  private _baseURL: string | undefined;

  /**
   * API metadata: contact name
   */
  private _contactName: string | undefined;

  /**
   * API metadata: contact URL
   */
  private _contactURL: string | undefined;

  /**
   * API metadata: contact email
   */
  private _contactEmail: string | undefined;

  /**
   * API metadata: license name
   */
  private _licenseName: string | undefined;

  /**
   * API metadata: license URL
   */
  private _licenseURL: string | undefined;

  /**
   * An array of class names to be excluded from the generated output
   */
  private _excludeClasses: string[] | undefined;

  /**
   * An array of property names to be excluded from the generated output
   */
  private _excludeProperties: string[] | undefined;

  /**
   * Output formats
   */
  private _outputFormat: OutputFormat[] | undefined;

  /**
   * Whether to disable the creation of links
   */
  private _disableLinks: boolean | undefined;

  /**
   * Whether to use expanded JSON-LD format or not
   */
  private _expanded: boolean | undefined;

  /**
   * An array of class names to be excluded from expansion
   */
  private _excludeClassesExpanded: string[] | undefined;

  /**
   * An array of property names to be excluded from expansion
   */
  private _excludePropertiesExpanded: string[] | undefined;

  public async createFromCli(params: YargsParams): Promise<void> {
    this._input = <string>params.input;
    this._output = <string>params.output;
    this._language = <string>params.language;
    this._versionSwagger = <string>params.versionSwagger;
    this._versionAPI = <string>params.versionAPI;
    this._title = <string>params.title;
    this._description = <string>params.description;
    this._contextURL = <string>params.contextURL;
    this._baseURL = <string>params.baseURL;
    this._contactName = <string>params.contactName;
    this._contactURL = <string>params.contactURL;
    this._contactEmail = <string>params.contactEmail;
    this._licenseName = <string>params.licenseName;
    this._licenseURL = <string>params.licenseURL;
    this._excludeClasses = <string[]>params.excludeClasses;
    this._excludeProperties = <string[]>params.excludeProperties;
    this._outputFormat = <OutputFormat[]>params.outputFormat;
    this._disableLinks = <boolean>params.disableLinks;
    this._expanded = <boolean>params.expanded;
    this._excludeClassesExpanded = <string[]>params.excludeClassesExpanded;
    this._excludePropertiesExpanded = <string[]>(
      params.excludePropertiesExpanded
    );
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

  public get versionSwagger(): string {
    if (!this._versionSwagger) {
      throw new Error(
        `Trying to access property "versionSwagger" before it was set.`,
      );
    }
    return this._versionSwagger;
  }

  public get versionAPI(): string {
    if (!this._versionAPI) {
      throw new Error(
        `Trying to access property "versionAPI" before it was set.`,
      );
    }
    return this._versionAPI;
  }

  public get title(): string {
    if (!this._title) {
      throw new Error(`Trying to access property "title" before it was set.`);
    }
    return this._title;
  }

  public get description(): string | undefined {
    return this._description;
  }

  public get contextURL(): string {
    if (!this._contextURL) {
      throw new Error(
        `Trying to access property "contextURL" before it was set.`,
      );
    }
    return this._contextURL;
  }

  public get baseURL(): string {
    if (!this._baseURL) {
      throw new Error(`Trying to access property "baseURL" before it was set.`);
    }
    return this._baseURL;
  }

  public get contactName(): string | undefined {
    return this._contactName;
  }

  public get contactURL(): string | undefined {
    return this._contactURL;
  }

  public get contactEmail(): string | undefined {
    return this._contactEmail;
  }

  public get licenseName(): string | undefined {
    return this._licenseName;
  }

  public get licenseURL(): string | undefined {
    return this._licenseURL;
  }

  public get excludeClasses(): string[] {
    return this._excludeClasses || [];
  }

  public get excludeProperties(): string[] {
    return this._excludeProperties || [];
  }

  public get outputFormat(): OutputFormat[] {
    return this._outputFormat || [OutputFormat.Json];
  }

  public get disableLinks(): boolean {
    return !!this._disableLinks;
  }

  public get expanded(): boolean {
    return !!this._expanded;
  }

  public get excludeClassesExpanded(): string[] {
    return this._excludeClassesExpanded || [];
  }

  public get excludePropertiesExpanded(): string[] {
    return this._excludePropertiesExpanded || [];
  }
}
