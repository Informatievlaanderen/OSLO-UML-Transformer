export const jsonldData = [
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/class/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'TestClass',
      },
    ],
  },
  {
    '@id': 'http://example.org/.well-known/id/class/2',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/class/2',
    },
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'AnotherTestClass',
      },
    ],
  },
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#label': [
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
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/property/2',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#label': [
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
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/class/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'TestClass',
      },
    ],
  },
  {
    '@id': 'http://example.org/.well-known/id/class/2',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/class/2',
    },
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'http://www.w3.org/2000/01/rdf-schema#label': [
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
  'http://example.org/assignedUri': {
    '@id': 'http://example.org/id/class/1',
  },
  '@type': 'http://www.w3.org/2002/07/owl#Class',
  'http://www.w3.org/2000/01/rdf-schema#label': [
    {
      '@language': 'nl',
      '@value': 'TestClass',
    },
  ],
};

export const propertyJsonld = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#label': [
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
    '@id': 'http://example.org/.well-known/id/class/2',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/class/2',
    },
    '@type': 'http://www.w3.org/2002/07/owl#Class',
  },
];

export const propertyJsonldWithoutRange = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'Test',
      },
    ],
  },
];

export const propertyJsonldWithoutDomain = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'Test',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': [
      {
        '@id': 'http://example.org/.well-known/id/class/2',
      },
    ],
  },
];

export const propertyJsonldWithStatement = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#label': [
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
    'http://www.w3.org/2000/01/rdf-schema#range': [
      {
        '@id': 'http://example.org/.well-known/id/class/2',
      },
    ],
  },
  {
    '@id': 'http://example.org/.well-known/id/class/2',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/class/2',
    },
    '@type': 'http://www.w3.org/2002/07/owl#Class',
  },
  {
    '@id': 'http://example.org/id/statement/1',
    '@type': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#subject': {
      '@id': 'http://example.org/.well-known/id/property/1',
    },
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate': {
      '@id': 'http://www.w3.org/2000/01/rdf-schema#domain',
    },
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#object': {
      '@id': 'http://example.org/.well-known/id/class/1',
    },
    'http://www.w3.org/2000/01/rdf-schema#label': 'TestDomain',
  },
];

export const propertyJsonldWithDuplicates = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#label': [
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
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/class/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'TestDomain',
      },
    ],
  },
  {
    '@id': 'http://example.org/.well-known/id/property/2',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/property/2',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#label': [
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
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/class/2',
    },
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'http://www.w3.org/2000/01/rdf-schema#label': [
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
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'TestClassLabel',
      },
    ],
  },
  {
    '@id': 'http://example.org/.well-known/id/property/2',
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#label': [
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
