export const RmlClassJoinMockData = [
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
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDescription':
      {
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
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'Datatype class label',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/2',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/2',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'Domain class label',
    },
  },
];

export const RmlLangStringMockData = [
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
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDescription':
      {
        '@language': 'nl',
        '@value': 'Property description',
      },
    'http://www.w3.org/2000/01/rdf-schema#range': {
      '@id': 'urn:oslo-toolchain:1727880001',
    },
    'http://www.w3.org/2000/01/rdf-schema#domain': {
      '@id': 'http://example.org/.well-known/id/class/2',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/2',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/2',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'Domain class label',
    },
  },
  {
    '@id': 'urn:oslo-toolchain:1727880001',
    '@type': 'Datatype',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'LangString',
    },
  },
];

export const RmlIntegerMockData = [
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
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDescription':
      {
        '@language': 'nl',
        '@value': 'Property description',
      },
    'http://www.w3.org/2000/01/rdf-schema#range': {
      '@id': 'urn:oslo-toolchain:1727880002',
    },
    'http://www.w3.org/2000/01/rdf-schema#domain': {
      '@id': 'http://example.org/.well-known/id/class/2',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/2',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/2',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'Domain class label',
    },
  },
  {
    '@id': 'urn:oslo-toolchain:1727880002',
    '@type': 'Datatype',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://www.w3.org/2001/XMLSchema#integer',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'Integer',
    },
  },
];

export const RmlConceptMockData = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    '@type': 'http://www.w3.org/2000/01/rdf-schema#ObjectProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'Property Concept URI',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDescription':
      {
        '@language': 'nl',
        '@value': 'Property Concept description',
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
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://www.w3.org/2004/02/skos/core#Concept',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'Concept label',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/2',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/2',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': {
      '@language': 'nl',
      '@value': 'Domain class label',
    },
  },
];

