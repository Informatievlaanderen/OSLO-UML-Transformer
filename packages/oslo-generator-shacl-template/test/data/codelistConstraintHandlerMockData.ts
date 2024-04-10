export const baseData = {
  '@id': 'http://example.org/.well-known/id/property/1',
  '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
    '@id': 'http://example.org/id/property/1',
  },
  'http://www.w3.org/ns/shacl#maxCount': '1',
  'http://www.w3.org/ns/shacl#minCount': '1',
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
    '@language': 'nl',
    '@value': 'PropertyLabel',
  },
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#codelist': {
    '@id': 'http://example.org/id/codelist/1',
  },
}

export const rangeWithCodelist = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    'http://www.w3.org/ns/shacl#maxCount': '1',
    'http://www.w3.org/ns/shacl#minCount': '1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'PropertyLabel',
    },
    'http://www.w3.org/2000/01/rdf-schema#range': {
      '@id': 'http://example.org/.well-known/id/class/1',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#codelist': {
      '@id': 'http://example.org/id/codelist/1',
    },
  },
]

export const propertyWithoutCodelistOrRange = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    'http://www.w3.org/ns/shacl#maxCount': '1',
    'http://www.w3.org/ns/shacl#minCount': '1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'PropertyLabel',
    },
  },
]

export const propertyWithoutCodelist = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    'http://www.w3.org/ns/shacl#maxCount': '1',
    'http://www.w3.org/ns/shacl#minCount': '1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'PropertyLabel',
    },
    'http://www.w3.org/2000/01/rdf-schema#range': {
      '@id': 'http://example.org/.well-known/id/class/1',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
  },
]

export const propertyWithoutLabel = {
  '@id': 'http://example.org/.well-known/id/property/1',
  '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
    '@id': 'http://example.org/id/property/1',
  },
  'http://www.w3.org/ns/shacl#maxCount': '1',
  'http://www.w3.org/ns/shacl#minCount': '1',
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#codelist': {
    '@id': 'http://example.org/id/codelist/1',
  },
}