export const baseData = {
  '@id': 'http://example.org/.well-known/id/property/1',
  '@type': 'http://www.w3.org/2000/01/rdf-schema#ObjectProperty',
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
    '@id': 'http://example.org/id/property/1',
  },
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
    '@language': 'nl',
    '@value': 'Property label',
  },
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDescription': {
    '@language': 'nl',
    '@value': 'Property description',
  },
  'http://www.w3.org/2000/01/rdf-schema#range': {
    '@id': 'http://example.org/.well-known/id/class/1',
  },
  'http://www.w3.org/2000/01/rdf-schema#domain': {
    '@id': 'http://example.org/.well-known/id/class/2',
  },
}

export const dataWithoutType = {
  '@id': 'http://example.org/.well-known/id/property/1',
}

export const dataWithoutLabel = {
  '@id': 'http://example.org/.well-known/id/property/1',
  '@type': 'http://www.w3.org/2000/01/rdf-schema#ObjectProperty',
}
