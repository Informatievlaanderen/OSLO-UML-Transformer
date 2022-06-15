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

export function extractDescription(object: any, language: string): string | null {
  const descriptions: any[] = object.definition;

  if (descriptions.length === 0) {
    return null;
  }

  const languageDescriptionObject = descriptions.filter(x => x['@language'] === language);

  if (languageDescriptionObject.length === 0) {
    return null;
  }

  // TODO: log error if length is greater than 1?

  return languageDescriptionObject[0]['@value'];
}
