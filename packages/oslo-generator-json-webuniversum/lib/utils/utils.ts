import { SpecificationType, Scope } from '@oslo-flanders/core';
import type { WebuniversumObject } from '../types/WebuniversumObject';

export const isInPackage: (classA: WebuniversumObject) => boolean = (
  classA: WebuniversumObject,
) => classA?.scope === Scope.InPackage;

export const isInPublication = (
  classA: WebuniversumObject,
  publicationEnvironment: string,
): boolean => classA?.id.includes(publicationEnvironment);

export const isInPublicationEnvironment: (
  classA: WebuniversumObject,
) => boolean = (classA: WebuniversumObject) =>
  classA?.scope === Scope.InPublicationEnvironment;

export const isExternal: (classA: WebuniversumObject) => boolean = (
  classA: WebuniversumObject,
) => classA?.scope === Scope.External;

export const isScoped: (classA: WebuniversumObject) => boolean = (
  classA: WebuniversumObject,
) => Boolean(classA?.scope);

export const sortWebuniversumObjects = (
  webuniversumObjects: WebuniversumObject[],
  specificationType:
    | SpecificationType.ApplicationProfile
    | SpecificationType.Vocabulary,
  language: string,
): WebuniversumObject[] =>
  webuniversumObjects.sort(
    (classA: WebuniversumObject, classB: WebuniversumObject) => {
      const labelA =
        specificationType === SpecificationType.Vocabulary
          ? classA.vocabularyLabel?.[language]
          : classA.applicationProfileLabel?.[language];
      const labelB =
        specificationType === SpecificationType.Vocabulary
          ? classB.vocabularyLabel?.[language]
          : classB.applicationProfileLabel?.[language];

      return (labelA || '').localeCompare(labelB || '');
    },
  );

export const filterWebuniversumObjects = (
  classes: WebuniversumObject[],
  filters: ((c: WebuniversumObject) => boolean)[],
): WebuniversumObject[] =>
  classes.filter((webuniversumObject: WebuniversumObject) =>
    filters.every((filter) => filter(webuniversumObject)),
  );

/**
 * Determines whether a URI is external based on its format
 * @param uri The URI to check
 * @returns Boolean indicating if the URI is external (true) or internal (false)
 */
export const isExternalUri = (uri: string): boolean =>
  // URIs starting with "urn:" are considered internal
  !uri.startsWith('urn:');
