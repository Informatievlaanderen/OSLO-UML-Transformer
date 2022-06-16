export function extractLabel(object: any, language: string): string | null {
  return extractPropertyByLanguage(object.label, language);
}

export function extractDescription(object: any, language: string): string | null {
  return extractPropertyByLanguage(object.definition, language);
}

export function extractUsageNote(object: any, language: string): string | null {
  return extractPropertyByLanguage(object.usageNote, language);
}

export function extractDomainLabel(object: any, language: string): string | null {
  return extractPropertyByLanguage(object.domain?.label, language);
}

function extractPropertyByLanguage(property: any[] | null, language: string): string | null {
  if (!property || property.length === 0) {
    return null;
  }

  const languageProperty = property.filter(x => x['@language'] === language);

  if (languageProperty.length === 0) {
    return null;
  }

  // TODO: log error if length is greater than 1?

  return languageProperty[0]['@value'];
}
