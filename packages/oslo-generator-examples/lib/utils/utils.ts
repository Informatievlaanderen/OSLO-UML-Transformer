function removeCaret(text: string): string {
  return text.replace(/^\^/u, '');
}

export function toCamelCase(text: string): string {
  return removeCaret(text)
    .replace(/(?:^\w|[A-Z]|\b\w)/gu, (word: string, index: number) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase(),
    )
    .replace(/\s+/gu, '')
    .replace(/\s\(source\)/gu, '(source)')
    .replace(/\s\(target\)/gu, '(target)');
}

// Utility function to remove trailing slash if it exists
export function removeTrailingSlash(str: string): string {
  return str.endsWith('/') ? str.slice(0, -1) : str;
}
