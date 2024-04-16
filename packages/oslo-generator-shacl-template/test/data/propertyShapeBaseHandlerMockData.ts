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
    'http://www.w3.org/2000/01/rdf-schema#domain': {
      '@id': 'http://example.org/.well-known/id/class/2',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    '@type': 'http://www.w3.org/2000/01/rdf-schema#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/2',
    '@type': 'http://www.w3.org/2000/01/rdf-schema#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/2',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'Domain class label',
    },
  },
]

export const dataWithNoAssignedURI = {
  '@id': 'http://example.org/.well-known/id/property/1',
  '@type': 'http://www.w3.org/2000/01/rdf-schema#ObjectProperty',
}

export const dataWithNoLabel = {
  '@id': 'http://example.org/.well-known/id/property/1',
  '@type': 'http://www.w3.org/2000/01/rdf-schema#ObjectProperty',
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
    '@id': 'http://example.org/id/property/1',
  },
}

export const dataWithNoDescription = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    '@type': 'http://www.w3.org/2000/01/rdf-schema#ObjectProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'PropertyLabel',
    },
    'http://www.w3.org/2000/01/rdf-schema#range': {
      '@id': 'http://example.org/.well-known/id/class/1',
    },
    'http://www.w3.org/2000/01/rdf-schema#domain': {
      '@id': 'http://example.org/.well-known/id/class/2',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    '@type': 'http://www.w3.org/2000/01/rdf-schema#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/2',
    '@type': 'http://www.w3.org/2000/01/rdf-schema#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/2',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'DomainClassLabel',
    },
  },
]

export const dataWithNoRange = {
  '@id': 'http://example.org/.well-known/id/property/1',
  '@type': 'http://www.w3.org/2000/01/rdf-schema#ObjectProperty',
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
    '@id': 'http://example.org/id/property/1',
  },
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
    '@language': 'nl',
    '@value': 'PropertyLabel',
  },
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDescription': {
    '@language': 'nl',
    '@value': 'PropertyDescription',
  },
}

export const dataWithNoRangeAssignedURI = {
  '@id': 'http://example.org/.well-known/id/property/1',
  '@type': 'http://www.w3.org/2000/01/rdf-schema#ObjectProperty',
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
    '@id': 'http://example.org/id/property/1',
  },
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
    '@language': 'nl',
    '@value': 'PropertyLabel',
  },
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDescription': {
    '@language': 'nl',
    '@value': 'PropertyDescription',
  },
  'http://www.w3.org/2000/01/rdf-schema#range': {
    '@id': 'http://example.org/.well-known/id/class/1',
  },
}

export const dataWithNoType = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'PropertyLabel',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDescription': {
      '@language': 'nl',
      '@value': 'PropertyDescription',
    },
    'http://www.w3.org/2000/01/rdf-schema#range': {
      '@id': 'http://example.org/.well-known/id/class/1',
    },
    'http://www.w3.org/2000/01/rdf-schema#domain': {
      '@id': 'http://example.org/.well-known/id/class/2',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    '@type': 'http://www.w3.org/2000/01/rdf-schema#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
  },
]

export const dataWithNoDomain = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    '@type': 'http://www.w3.org/2000/01/rdf-schema#ObjectProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'PropertyLabel',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDescription': {
      '@language': 'nl',
      '@value': 'PropertyDescription',
    },
    'http://www.w3.org/2000/01/rdf-schema#range': {
      '@id': 'http://example.org/.well-known/id/class/1',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    '@type': 'http://www.w3.org/2000/01/rdf-schema#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
  },
]

export const dataWithoutDomainLabel = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    '@type': 'http://www.w3.org/2000/01/rdf-schema#ObjectProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'PropertyLabel',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDescription': {
      '@language': 'nl',
      '@value': 'PropertyDescription',
    },
    'http://www.w3.org/2000/01/rdf-schema#range': {
      '@id': 'http://example.org/.well-known/id/class/1',
    },
    'http://www.w3.org/2000/01/rdf-schema#domain': {
      '@id': 'http://example.org/.well-known/id/class/2',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    '@type': 'http://www.w3.org/2000/01/rdf-schema#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/2',
    '@type': 'http://www.w3.org/2000/01/rdf-schema#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/2',
    },
  },
]


