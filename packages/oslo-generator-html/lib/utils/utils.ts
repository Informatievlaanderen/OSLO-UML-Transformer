import type { Class } from '../types/Class';
import type { Languages } from './languageEnum';

export function sortClasses(classes: Class[], language: Languages): Class[] {
  return classes.sort((classA, classB) =>
    classA.vocabularyLabel[language].localeCompare(
      classB.vocabularyLabel[language],
    ),
  );
}
