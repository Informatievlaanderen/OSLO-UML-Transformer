import type { EaObject, EaTag } from '@oslo-flanders/ea-uml-extractor';
import { CasingTypes } from '../enums/CasingTypes';
import { TagNames } from '../enums/TagNames';
import type { UriRegistry } from '../UriRegistry';

export function ignore(object: EaObject): boolean {
  const ignoreObject = getTagValue(object, TagNames.Ignore, false);
  return Boolean(ignoreObject);
}

export function getTagValue(object: any, tagName: TagNames, _default: any): string {
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

// TODO: this function should be removed and logic should be part of connectors
export function extractUri(object: EaObject, packageUri: URL, casing?: CasingTypes): URL {
  const uri = getTagValue(object, TagNames.ExternalUri, null);

  if (uri) {
    return new URL(uri);
  }

  let localName = getTagValue(object, TagNames.LocalName, null);

  if (!localName) {
    localName = object.name;
  } else {
    localName = convertToCase(localName, casing);
  }

  if (localName && localName !== '') {
    return new URL(packageUri.toString() + localName);
  }

  return new URL(`${packageUri.toString()}${object.name}`);
}

export function convertToCase(text: string, casing?: CasingTypes): string {
  if (text === null || text === '') {
    // TODO: log message
    return '';
  }

  text = removeCaret(text);

  if (casing === CasingTypes.PascalCase) {
    return toPascalCase(text);
  }

  let casedText = '';
  if (text.includes('.')) {
    const parts = text.split('.');
    casedText = parts[0];

    parts.slice(1).forEach(part => {
      casedText += `.${toCamelCase(part)}`;
    });
  } else {
    return toCamelCase(text);
  }

  return casedText;
}

export function getDefininingPackageUri(uriRegistry: UriRegistry, packageName: string, currentPackageUri: URL): URL {
  const referencedPackages = uriRegistry.packageNameToPackageMap.get(packageName) || [];

  if (referencedPackages.length === 0) {
    // TODO: log messag
    return currentPackageUri;
  }

  if (referencedPackages.length > 1) {
    // TODO: log message
  }

  return uriRegistry.packageIdUriMap.get(referencedPackages[0].packageId)!;
}

function removeCaret(text: string): string {
  return text.replace(/^\^/u, '');
}

function toPascalCase(text: string): string {
  return text.replace(/(?:^\w|[A-Z]|\b\w)/gu, (word: string, index: number) => word.toUpperCase()).replace(/\s+/gu, '');
}

function toCamelCase(text: string): string {
  return text.replace(/(?:^\w|[A-Z]|\b\w)/gu, (word: string, index: number) =>
    index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/gu, '');
}
