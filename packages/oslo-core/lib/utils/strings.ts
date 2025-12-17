function removeCaret(text: string): string {
  return text.replace(/^\^/u, '');
}

export function toPascalCase(text: string): string {
  return removeCaret(text)
    .replace(/(?:^\w|[A-Z]|\b\w)/gu, (word: string, index: number) =>
      word.toUpperCase(),
    )
    .replace(/\s+/gu, '');
}

export function toCamelCase(text: string): string {
  return removeCaret(text)
    .replace(/(?:^\w|[A-Z]|\b\w)/gu, (word: string, index: number) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase(),
    )
    .replace(/\s+/gu, '');
}
