import type { Class } from '../types/Class';
import type { Languages } from './languageEnum';

export const sortClasses = (classes: Class[], language: Languages): Class[] =>
  classes.sort((classA, classB) =>
    classA.vocabularyLabel[language].localeCompare(
      classB.vocabularyLabel[language],
    ),
  );

export const sortDataTypeProperties = (
  dataTypes: Class[],
  language: Languages,
): Class[] =>
  dataTypes.map((dataType) => ({
    ...dataType,
    properties: dataType?.properties?.sort(
      (propertyA: Class, propertyB: Class) =>
        propertyA.applicationProfileLabel[language].localeCompare(
          propertyB.applicationProfileLabel[language],
        ),
    ),
  }));
