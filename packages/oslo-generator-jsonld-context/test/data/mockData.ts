export const jsonldData = [
  {
    '@id': 'http://example.org/id/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'TestClass',
      },
    ],
  },
  {
    '@id': 'http://example.org/id/class/2',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'AnotherTestClass',
      },
    ],
  },
  {
    '@id': 'http://example.org/id/property/1',
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'TestProperty',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/id/class/1',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': {
      '@id': 'http://example.org/id/class/2',
    },
  },
  {
    '@id': 'http://example.org/id/property/2',
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'AnotherTestProperty',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/id/class/1',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': {
      '@id': 'http://example.org/id/class/2',
    },
  },
];

export const classJsonldWithDuplicates = [
  {
    '@id': 'http://example.org/id/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'TestClass',
      },
    ],
  },
  {
    '@id': 'http://example.org/id/class/2',
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
  '@id': 'http://example.org/id/class/1',
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
    '@id': 'http://example.org/id/property/1',
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'Test',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/id/class/1',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': {
      '@id': 'http://example.org/id/class/2',
    },
  },
];

export const propertyJsonldWithoutRange = [
  {
    '@id': 'http://example.org/id/property/1',
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
    '@id': 'http://example.org/id/property/1',
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'Test',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': [
      {
        '@id': 'http://example.org/id/class/2',
      },
    ],
  },
];

export const propertyJsonldWithMultipleStatements = [
  {
    '@id': 'http://example.org/id/property/1',
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'Test',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/id/class/1',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': [
      {
        '@id': 'http://example.org/id/class/2',
      },
    ],
  },
  {
    '@id': 'http://example.org/id/statement/1',
    '@type': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#subject': 'http://example.org/id/property/1',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate': 'http://www.w3.org/2000/01/rdf-schema#domain',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#object': 'http://example.org/id/class/1',
    'http://www.w3.org/2000/01/rdf-schema#label': 'TestDomain',
  },
  {
    '@id': 'http://example.org/id/statement/2',
    '@type': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#subject': 'http://example.org/id/property/1',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate': 'http://www.w3.org/2000/01/rdf-schema#domain',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#object': 'http://example.org/id/class/1',
    'http://www.w3.org/2000/01/rdf-schema#label': 'AnotherTestDomain',
  },
];

export const propertyJsonldWithStatement = [
  {
    '@id': 'http://example.org/id/property/1',
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'Test',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/id/class/1',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': [
      {
        '@id': 'http://example.org/id/class/2',
      },
    ],
  },
  {
    '@id': 'http://example.org/id/statement/1',
    '@type': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#subject': 'http://example.org/id/property/1',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate': 'http://www.w3.org/2000/01/rdf-schema#domain',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#object': 'http://example.org/id/class/1',
    'http://www.w3.org/2000/01/rdf-schema#label': 'TestDomain',
  },
];

export const propertyJsonldWithDuplicates = [
  {
    '@id': 'http://example.org/id/property/1',
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'TestLabel',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/id/class/1',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': [
      {
        '@id': 'http://example.org/id/class/2',
      },
    ],
  },
  {
    '@id': 'http://example.org/id/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'TestDomain',
      },
    ],
  },
  {
    '@id': 'http://example.org/id/property/2',
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'TestLabel',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/id/class/2',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': [
      {
        '@id': 'http://example.org/id/class/2',
      },
    ],
  },
  {
    '@id': 'http://example.org/id/class/2',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'http://www.w3.org/2000/01/rdf-schema#label': [
      {
        '@language': 'en',
        '@value': 'AnotherTestDomain',
      },
    ],
  },
];
