import { URL } from 'url';
import type { EaObject, EaTag } from '@oslo-flanders/ea-uml-extractor';
import { CasingTypes } from '../enums/CasingTypes';
import { TagNames } from '../enums/TagNames';
import type { UriRegistry } from '../UriRegistry';

export function ignore(object: EaObject): boolean {
  const ignoreObject = getTagValue(object, TagNames.Ignore, false);
  return Boolean(ignoreObject);
}

export function getTagValue(
  object: any,
  tagName: TagNames,
  _default: any
): string {
  const tags = object.tags?.filter((x: EaTag) => x.tagName === tagName);

  if (!tags || tags.length === 0) {
    // TODO: log message
    return _default;
  }

  if (tags.length > 1) {
    // TODO: log message
  }

  return tags[0].tagValue;
}

export function getDefininingPackageUri(
  uriRegistry: UriRegistry,
  packageName: string,
  currentPackageUri: URL
): URL {
  const referencedPackages =
    uriRegistry.packageNameToPackageMap.get(packageName) || [];

  if (referencedPackages.length === 0) {
    // TODO: log messag
    return currentPackageUri;
  }

  if (referencedPackages.length > 1) {
    // TODO: log message
  }

  return uriRegistry.packageIdUriMap.get(referencedPackages[0].packageId)!;
}

export function updateNameTag(tags: EaTag[], connectorName: string): EaTag[] {
  const nameTag = tags.find((x) => x.tagName === TagNames.LocalName);
  if (nameTag) {
    nameTag.tagValue = connectorName;
  } else {
    tags.push({
      tagName: TagNames.LocalName,
      tagValue: connectorName,
    });
  }

  return tags;
}

function removeCaret(text: string): string {
  return text.replace(/^\^/u, '');
}

export function toPascalCase(text: string): string {
  return removeCaret(text)
    .replace(/(?:^\w|[A-Z]|\b\w)/gu, (word: string, index: number) =>
      word.toUpperCase()
    )
    .replace(/\s+/gu, '');
}

export function toCamelCase(text: string): string {
  return removeCaret(text)
    .replace(/(?:^\w|[A-Z]|\b\w)/gu, (word: string, index: number) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/gu, '');
}
