export const baseData = {
  '@id': 'http://example.org/.well-known/id/property/1',
  '@type': 'http://www.w3.org/2000/01/rdf-schema#ObjectProperty',
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
    '@id': 'http://example.org/id/property/1',
  },
  'http://www.w3.org/ns/shacl#maxCount': '1',
  'http://www.w3.org/ns/shacl#minCount': '1',
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
    '@language': 'nl',
    '@value': 'PropertyLabel',
  },
}

export const dataWithoutLabel = {
  '@id': 'http://example.org/.well-known/id/property/1',
  '@type': 'http://www.w3.org/2000/01/rdf-schema#ObjectProperty',
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
    '@id': 'http://example.org/id/property/1',
  },
  'http://www.w3.org/ns/shacl#maxCount': '1',
  'http://www.w3.org/ns/shacl#minCount': '1',
}

export const nCardinalityConstraint = {
  '@id': 'http://example.org/.well-known/id/property/1',
  '@type': 'http://www.w3.org/2000/01/rdf-schema#ObjectProperty',
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
    '@id': 'http://example.org/id/property/1',
  },
  'http://www.w3.org/ns/shacl#maxCount': '*',
}