export function extractLabel(object: any, language: string): string | null {
  const labels: any[] = object.label;

  if (labels.length === 0) {
    return null;
  }

  const languageLabelObject = labels.filter(x => x['@language'] === language);

  if (languageLabelObject.length === 0) {
    return null;
  }

  // TODO: log error if length is greater than 1?

  return languageLabelObject[0]['@value'];
}

export function toPascalCase(text: string): string {
  return text.replace(/(?:^\w|[A-Z]|\b\w)/gu, (word: string, index: number) => word.toUpperCase()).replace(/\s+/gu, '');
}

export function toCamelCase(text: string): string {
  return text.replace(/(?:^\w|[A-Z]|\b\w)/gu, (word: string, index: number) =>
    index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/gu, '');
}

export function alphabeticalSort(source: [string, any][]): [string, any][] {
  return source.sort(([key1, value1], [key2, value2]) => key1.localeCompare(key2));
}
