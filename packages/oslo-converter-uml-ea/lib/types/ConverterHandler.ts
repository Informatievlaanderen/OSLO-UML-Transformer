import type { OutputHandler } from '@oslo-flanders/core';
import { Scope } from '@oslo-flanders/core';
import type { EaDiagram, EaObject, EaTag } from '@oslo-flanders/ea-uml-extractor';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import type { ConverterHandlerMediator } from '../ConverterHandlerMediator';
import type { RequestType } from '../enums/RequestType';
import { TagName } from '../enums/TagName';
import type { UriAssigner } from '../UriAssigner';
import { getTagValue } from '../utils/utils';

export abstract class ConverterHandler<T extends EaObject> {
  protected readonly mediator: ConverterHandlerMediator;
  private nextHandler: ConverterHandler<T> | undefined;
  protected readonly factory: DataFactory;
  protected _outputHandler: OutputHandler | undefined;
  protected _uriAssigner: UriAssigner | undefined;
  private _specificationType: string | undefined;
  private _publicationEnvironmentDomain: string | undefined;

  public constructor(mediator: ConverterHandlerMediator) {
    this.mediator = mediator;
    this.factory = new DataFactory();
  }

  public abstract addObjectToOutput(
    object: T,
    targetDiagram?: EaDiagram,
  ): Promise<void>;

  public setNextConverterHandler(handler: ConverterHandler<EaObject>): ConverterHandler<EaObject> {
    this.nextHandler = handler;
    return handler;
  }

  public handleRequest(requestType: RequestType, object: EaObject): void {
    if (this.nextHandler) {
      return this.nextHandler?.handleRequest(requestType, object);
    }
    // TODO: log error message?
  }

  public get outputHandler(): OutputHandler {
    if (!this._outputHandler) {
      throw new Error(`OutputHandler has not been set yet.`);
    }
    return this._outputHandler;
  }

  public set outputHandler(value: OutputHandler) {
    this._outputHandler = value;
  }

  public get uriAssigner(): UriAssigner {
    if (!this._uriAssigner) {
      throw new Error(`UriAssigner has not been set yet.`);
    }
    return this._uriAssigner;
  }

  public set uriAssigner(value: UriAssigner) {
    this._uriAssigner = value;
  }

  public get specificationType(): string {
    if (!this._specificationType) {
      throw new Error(`Specification type has not been set yet.`);
    }
    return this._specificationType;
  }

  public set specificationType(value: string) {
    this._specificationType = value;
  }

  public get publicationEnvironmentDomain(): string {
    if (!this._publicationEnvironmentDomain) {
      throw new Error(`Publication environment domain has not been set yet.`);
    }
    return this._publicationEnvironmentDomain;
  }

  public set publicationEnvironmentDomain(value: string) {
    this._publicationEnvironmentDomain = value;
  }

  public getLabel(object: T): RDF.Literal[] {
    return this.specificationType === 'ApplicationProfile' ?
      this.getLanguageDependentTag(object, TagName.ApLabel, TagName.Label) :
      this.getLanguageDependentTag(object, TagName.Label);
  }

  public getDefinition(object: T): RDF.Literal[] {
    return this.specificationType === 'ApplicationProfile' ?
      this.getLanguageDependentTag(object, TagName.ApDefinition, TagName.Definition) :
      this.getLanguageDependentTag(object, TagName.Definition);
  }

  public getUsageNote(object: T): RDF.Literal[] {
    return this.specificationType === 'ApplicationProfile' ?
      this.getLanguageDependentTag(object, TagName.ApUsageNote, TagName.UsageNote) :
      this.getLanguageDependentTag(object, TagName.UsageNote);
  }

  // TODO: watch out for URI tags containing a data.vlaanderen URI
  public getScope(object: T, packageBaseUri: string, idUriMap: Map<number, string>): Scope {
    const uri = getTagValue(object, TagName.ExternalUri, null) || idUriMap.get(object.id);

    if (!uri) {
      // TODO: log error
      return Scope.Undefined;
    }

    if (uri.startsWith(packageBaseUri)) {
      return Scope.InPackage;
    }

    if (uri.startsWith(this.publicationEnvironmentDomain)) {
      return Scope.InPublicationEnvironment;
    }

    return Scope.External;
  }

  private getLanguageDependentTag(object: T, tagName: TagName, fallbackTag?: TagName): RDF.Literal[] {
    const tags = object.tags?.filter((x: EaTag) => x.tagName?.startsWith(tagName));
    const literals: RDF.Literal[] = [];

    const languageToTagValueMap = new Map<string, string>();

    if (!tags || tags.length === 0) {
      // Log warning that primary tag choice is not available, and fallback will be applied
      if (!fallbackTag) {
        // Log error that there is no fallback anymore
        return literals;
      }

      return this.getLanguageDependentTag(object, fallbackTag);
    }

    tags.forEach((tag: EaTag) => {
      const parts = tag.tagName.split('-');
      const languageCode = parts[parts.length - 1];

      if (languageToTagValueMap.has(languageCode)) {
        // TODO: add option to log silently
        // Log warning that object has multiple occurrences and will be overriden
      }

      const tagValue = tag.tagValue;
      if (!tagValue) {
        // Log warning for empty field?
        return;
      }

      literals.push(this.factory.literal(tagValue.trim(), languageCode));
    });

    return literals;
  }
}
