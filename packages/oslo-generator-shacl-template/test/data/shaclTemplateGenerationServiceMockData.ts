export const baseData = [
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'en',
      '@value': 'Class Label',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'en',
      '@value': 'Property Label',
    },
    'http://www.w3.org/2000/01/rdf-schema#domain': {
      '@id': 'http://example.org/.well-known/id/class/1',
    },
  },
]

export const dataWithoutLabel = {
  '@id': 'http://example.org/.well-known/id/class/1',
  '@type': 'http://www.w3.org/2002/07/owl#Class',
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
    '@id': 'http://example.org/id/class/1',
  },
}

export const dataWithoutDomain = {
  '@id': 'http://example.org/.well-known/id/property/1',
  '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
    '@id': 'http://example.org/id/property/1',
  },
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
    '@language': 'en',
    '@value': 'Property Label',
  },
}

export const dataWithoutDomainLabel = [
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'en',
      '@value': 'Property Label',
    },
    'http://www.w3.org/2000/01/rdf-schema#domain': {
      '@id': 'http://example.org/.well-known/id/class/1',
    },
  },
]