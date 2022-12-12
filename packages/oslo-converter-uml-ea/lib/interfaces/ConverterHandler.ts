import { Logger, Scope } from '@oslo-flanders/core';
import type { DataRegistry, EaObject, EaTag } from '@oslo-flanders/ea-uml-extractor';
import type * as RDF from '@rdfjs/types';
import { inject, injectable } from 'inversify';
import { DataFactory } from 'rdf-data-factory';
import { EaUmlConverterConfiguration } from '../config/EaUmlConverterConfiguration';
import { EaUmlConverterServiceIdentifier } from '../config/EaUmlConverterServiceIdentifier';
import { TagNames } from '../enums/TagNames';
import type { UriRegistry } from '../UriRegistry';

@injectable()
export abstract class ConverterHandler<T extends EaObject> {
  @inject(EaUmlConverterServiceIdentifier.Configuration) public readonly config!: EaUmlConverterConfiguration;
  @inject(EaUmlConverterServiceIdentifier.Logger) public readonly logger!: Logger;
  public readonly df = new DataFactory();

  /**
   * Creates RDF.Quads for objects with type T in the normalized model and adds them to an RDF.Store
   */
  public abstract convert(model: DataRegistry, uriRegistry: UriRegistry, store: RDF.Store): Promise<RDF.Store>;

  /**
   * Normalizes objects with type T in the data model
   */
  public abstract normalize(model: DataRegistry): Promise<DataRegistry>;

  /**
   * Assigns URIs to objects with type T in the data model and adds them to the URI registry
   */
  public abstract assignUris(normalizedModel: DataRegistry, uriRegistry: UriRegistry): Promise<UriRegistry>;

  /**
   * Creates and returns quads for an object with type T
   */
  public abstract createQuads(object: T, uriRegistry: UriRegistry, model?: DataRegistry): RDF.Quad[];

  /**
   * Removes objects that contain an ignore tag
   * @param model
   */
  public abstract filterIgnoredObjects(model: DataRegistry): Promise<DataRegistry>;

  public getLabel(object: T): RDF.Literal[] {
    return this.config.specificationType === 'ApplicationProfile' ?
      this.getLanguageDependentTag(object, TagNames.ApLabel, TagNames.Label) :
      this.getLanguageDependentTag(object, TagNames.Label);
  }

  public getDefinition(object: T): RDF.Literal[] {
    return this.config.specificationType === 'ApplicationProfile' ?
      this.getLanguageDependentTag(object, TagNames.ApDefinition, TagNames.Definition) :
      this.getLanguageDependentTag(object, TagNames.Definition);
  }

  public getUsageNote(object: T): RDF.Literal[] {
    return this.config.specificationType === 'ApplicationProfile' ?
      this.getLanguageDependentTag(object, TagNames.ApUsageNote, TagNames.UsageNote) :
      this.getLanguageDependentTag(object, TagNames.UsageNote);
  }

  // TODO: watch out for URI tags containing a data.vlaanderen URI
  public getScope(object: T, packageBaseUri: string, idUriMap: Map<number, URL>): Scope {
    const uri = idUriMap.get(object.id);

    if (!uri) {
      // TODO: log message
      return Scope.Undefined;
    }

    if (uri.toString().startsWith(packageBaseUri)) {
      return Scope.InPackage;
    }

    // TODO: can we use base URI instead of publicationEnvironmentVariable?
    if (uri.toString().startsWith(this.config.baseUri)) {
      return Scope.InPublicationEnvironment;
    }

    return Scope.External;
  }

  /**
   * Returns all values of tags that contain the tag name
   * @param object — The object to extract the tag values from
   * @param name  — The tag name
   * @param fallbackTag  — Depending on the specification type, a fallback tag will be used to get tag values
   * When specification type is 'ApplicationProfile' and certain tags are not added,
   * the vocabulary fallback tags are used
   */
  private getLanguageDependentTag(object: T, name: TagNames, fallbackTag?: TagNames): RDF.Literal[] {
    const tags = object.tags?.filter((x: EaTag) => x.tagName?.startsWith(name));
    const literals: RDF.Literal[] = [];

    const languageToTagValueMap = new Map<string, string>();

    if (!tags || tags.length === 0) {
      // TODO: Log warning that primary tag choice is not available, and fallback will be applied
      if (!fallbackTag) {
        // TODO: Log error that there is no fallback anymore
        return literals;
      }

      return this.getLanguageDependentTag(object, fallbackTag);
    }

    tags.forEach((tag: EaTag) => {
      const languageCode = tag.tagName.split('-').slice(1)[0];

      if (languageToTagValueMap.has(languageCode)) {
        // TODO: Log warning that object has multiple occurrences and will be overriden
      }

      const tagValue = tag.tagValue;
      if (!tagValue) {
        // TODO: Log warning for empty field?
        return;
      }

      literals.push(this.df.literal(tagValue.trim(), languageCode));
    });

    return literals;
  }
}
