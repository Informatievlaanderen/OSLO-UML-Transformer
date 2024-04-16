export const baseData = [
  {
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
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    '@type': 'http://www.w3.org/2000/01/rdf-schema#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'Class label',
    },
  },
]

export const dataWithoutRange = [
  {
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
  },
]

export const dataWithoutRangeAssignedURI = [
  {
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
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    '@type': 'http://www.w3.org/2000/01/rdf-schema#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'Class label',
    },
  },
]

export const dataWithoutLabel = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    '@type': 'http://www.w3.org/2000/01/rdf-schema#ObjectProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDescription': {
      '@language': 'nl',
      '@value': 'Property description',
    },
    'http://www.w3.org/2000/01/rdf-schema#range': {
      '@id': 'http://example.org/.well-known/id/class/1',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    '@type': 'http://www.w3.org/2000/01/rdf-schema#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'Class label',
    },
  },
]