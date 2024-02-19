export const jsonldData = [
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'TestClass',
      },
    ],
  },
  {
    '@id': 'http://example.org/.well-known/id/class/2',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/2',
    },
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'AnotherTestClass',
      },
    ],
  },
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'TestProperty',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/.well-known/id/class/1',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': {
      '@id': 'http://example.org/.well-known/id/class/2',
    },
    'http://w3.org/ns/shacl#maxCount': '*',
  },
  {
    '@id': 'http://example.org/.well-known/id/property/2',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/2',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'AnotherTestProperty',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/.well-known/id/class/1',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': {
      '@id': 'http://example.org/.well-known/id/class/2',
    },
  },
];

export const classJsonldWithDuplicates = [
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'TestClass',
      },
    ],
  },
  {
    '@id': 'http://example.org/.well-known/id/class/2',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/2',
    },
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'TestClass',
      },
    ],
  },
];

export const classJsonld =
{
  '@id': 'http://example.org/.well-known/id/class/1',
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
    '@id': 'http://example.org/id/class/1',
  },
  '@type': 'http://www.w3.org/2002/07/owl#Class',
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
    {
      '@language': 'nl',
      '@value': 'TestClass',
    },
  ],
};

export const propertyJsonld = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'Test',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/.well-known/id/class/1',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': {
      '@id': 'http://example.org/.well-known/id/class/2',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'TestClass',
      },
    ],
  },
  {
    '@id': 'http://example.org/.well-known/id/class/2',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/2',
    },
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'AnotherTestClass',
      },
    ],
  },
];

export const propertyJsonldWithoutLabel = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
  },
]

export const propertyJsonldWithoutRange = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'Test',
      },
    ],
  },
];

export const propertyJsonldWithoutRangeAssignedURI = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'Test',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': {
      '@id': 'http://example.org/.well-known/id/class/1',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'TestClass',
      },
    ],
  },
];

export const propertyJsonldWithoutDomain = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'Test',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': [
      {
        '@id': 'http://example.org/.well-known/id/class/1',
      },
    ],
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'TestClass',
      },
    ],
  },
];

export const propertyJsonldWithoutDomainLabel = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'Test',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': [
      {
        '@id': 'http://example.org/.well-known/id/class/1',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/.well-known/id/class/2',
      },
    ],
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'TestClass',
      },
    ],
  },
  {
    '@id': 'http://example.org/.well-known/id/class/2',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/2',
    },
  },
];

export const propertyJsonldWithDuplicates = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'TestLabel',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/.well-known/id/class/1',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': [
      {
        '@id': 'http://example.org/.well-known/id/class/2',
      },
    ],
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'TestDomain',
      },
    ],
  },
  {
    '@id': 'http://example.org/.well-known/id/property/2',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/2',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'TestLabel',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/.well-known/id/class/2',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': [
      {
        '@id': 'http://example.org/.well-known/id/class/2',
      },
    ],
  },
  {
    '@id': 'http://example.org/.well-known/id/class/2',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/2',
    },
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'AnotherTestDomain',
      },
    ],
  },
];

export const jsonLdWithoutAssignedUris = [
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'TestClassLabel',
      },
    ],
  },
  {
    '@id': 'http://example.org/.well-known/id/property/2',
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'TestAttributeLabel',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/.well-known/id/class/1',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': [
      {
        '@id': 'http://example.org/.well-known/id/class/1',
      },
    ],
  },
];

export const jsonldPropertyWithMaxCardinality = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://w3.org/ns/shacl#maxCount': '*',
  },
  {
    '@id': 'http://example.org/.well-known/id/property/2',
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://w3.org/ns/shacl#maxCount': '1',
  },
];
