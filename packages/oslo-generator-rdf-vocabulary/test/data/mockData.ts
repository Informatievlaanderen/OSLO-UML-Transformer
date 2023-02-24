export const jsonldPackageWithoutAssignedUri = [
  {
    '@id': 'http://example.org/.well-known/id/package/1',
    '@type': 'http://example.org/Package',
  },
];

export const jsonldPackage = [
  {
    '@id': 'http://example.org/.well-known/id/package/1',
    '@type': 'http://example.org/Package',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/package/1',
    },
  },
];

export const jsonldWithClassAndProperty = [
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
    'http://www.w3.org/2000/01/rdf-schema#comment': [
      {
        '@language': 'en',
        '@value': 'A comment',
      },
    ],
    'http://purl.org/vocab/vann/usageNote': [
      {
        '@language': 'en',
        '@value': 'A usage note',
      },
    ],
    'http://example.org/scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#comment': [
      {
        '@language': 'en',
        '@value': 'Comment on property',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/.well-known/id/class/1',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#range': {
      '@id': 'http://example.org/.well-known/id/class/1',
    },
    'http://purl.org/vocab/vann/usageNote': [
      {
        '@language': 'en',
        '@value': 'A usage note of the property',
      },
    ],
    'http://example.org/scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
];

export const jsonldClassWithoutAssignedUri = [
  {
    '@id': 'http://example.org/id/.well-known/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'http://example.org/scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
];

export const jsonldClassWithoutDefinition = [
  {
    '@id': 'http://example.org/id/.well-known/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/class/1',
    },
    'http://example.org/scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
];

export const jsonldClassWithParent = [
  {
    '@id': 'http://example.org/id/.well-known/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/class/1',
    },
    'http://www.w3.org/2000/01/rdf-schema#comment': [
      {
        '@language': 'en',
        '@value': 'A comment',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#subClassOf': {
      '@id': 'http://example.org/id/.well-known/class/2',
    },
    'http://example.org/scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
  {
    '@id': 'http://example.org/id/.well-known/class/2',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/class/2',
    },
  },
];

export const jsonldParentWithoutAssignedUri = [
  {
    '@id': 'http://example.org/id/.well-known/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/class/1',
    },
    'http://www.w3.org/2000/01/rdf-schema#comment': [
      {
        '@language': 'en',
        '@value': 'A comment',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#subClassOf': {
      '@id': 'http://example.org/id/.well-known/class/2',
    },
    'http://example.org/scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
  {
    '@id': 'http://example.org/id/.well-known/class/2',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
  },
];

export const jsonldAttributeWithoutAssignedUri = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://example.org/scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
];

export const jsonldAttributeWithoutDomain = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://example.org/scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
];

export const jsonldDomainWithoutAssignedUri = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/.well-known/id/class/1',
      },
    ],
    'http://example.org/scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
];

export const jsonldDomainWithoutRange = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/.well-known/id/class/1',
      },
    ],
    'http://example.org/scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/class/1',
    },
  },
];

export const jsonldRangeWithoutAssignedUri = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
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
    'http://example.org/scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/class/1',
    },
  },
];

export const jsonldAttributeWithRangeStatement = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
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
    'http://example.org/scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/class/1',
    },
  },
  {
    '@id': 'http://example.org/id/.well-known/statement/1',
    '@type': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#subject': {
      '@id': 'http://example.org/.well-known/id/property/1',
    },
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate': {
      '@id': 'http://www.w3.org/2000/01/rdf-schema#range',
    },
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#object': {
      '@id': 'http://example.org/.well-known/id/class/2',
    },
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/class/2',
    },
  },
];

export const jsonldAttributeWithParent = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'http://example.org/assignedUri': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
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
    'http://www.w3.org/2000/01/rdf-schema#subPropertyOf': {
      '@id': 'http://example.org/id/parent/1',
    },
    'http://example.org/scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
];
