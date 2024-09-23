import { Scope } from '@oslo-flanders/core';
import type { WebuniversumObject } from '../types/WebuniversumObject';

export const isInPackage: (classA: WebuniversumObject) => boolean = (
  classA: WebuniversumObject,
) => classA?.scope === Scope.InPackage;

export const isInPublication = (
  classA: WebuniversumObject,
  publicationEnvironment: string,
): boolean => classA?.id.includes(publicationEnvironment);

export const isInPublicationEnvironment: (
  classA: WebuniversumObject
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
  language: string,
): WebuniversumObject[] =>
  webuniversumObjects.sort(
    (classA: WebuniversumObject, classB: WebuniversumObject) =>
      (classA.vocabularyLabel?.[language] || '').localeCompare(
        classB.vocabularyLabel?.[language] || '',
      ),
  );

export const filterWebuniversumObjects = (
  classes: WebuniversumObject[],
  filters: ((c: WebuniversumObject) => boolean)[],
): WebuniversumObject[] =>
  classes.filter((webuniversumObject: WebuniversumObject) =>
    filters.every((filter) => filter(webuniversumObject)),
  );
