export const jsonldPackageWithoutAssignedUri = [
  {
    '@id': 'http://example.org/.well-known/id/package/1',
    '@type': 'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#Package',
  },
];

export const jsonldPackage = [
  {
    '@id': 'http://example.org/.well-known/id/package/1',
    '@type': 'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#Package',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/package/1',
    },
  },
];

export const jsonldWithClassAndProperty = [
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocLabel': [
      {
        '@language': 'en',
        '@value': 'TestClass',
      },
    ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocDefinition': [
      {
        '@language': 'en',
        '@value': 'A comment',
      },
    ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocUsageNote': [
      {
        '@language': 'en',
        '@value': 'A vocabulary usage note',
      },
    ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocDefinition': [
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
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocUsageNote': [
      {
        '@language': 'en',
        '@value': 'A usage note of the property',
      },
    ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
];

export const jsonldClassWithoutAssignedUri = [
  {
    '@id': 'http://example.org/id/.well-known/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
];

export const jsonldClassWithoutDefinition = [
  {
    '@id': 'http://example.org/id/.well-known/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
];

export const jsonldClassWithParent = [
  {
    '@id': 'http://example.org/id/.well-known/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocDefinition': [
      {
        '@language': 'en',
        '@value': 'A comment',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#subClassOf': {
      '@id': 'http://example.org/id/.well-known/class/2',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
  {
    '@id': 'http://example.org/id/.well-known/class/2',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/2',
    },
  },
];

export const jsonldParentWithoutAssignedUri = [
  {
    '@id': 'http://example.org/id/.well-known/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocDefinition': [
      {
        '@language': 'en',
        '@value': 'A comment',
      },
    ],
    'http://www.w3.org/2000/01/rdf-schema#subClassOf': {
      '@id': 'http://example.org/id/.well-known/class/2',
    },
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#scope': {
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
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
];

export const jsonldAttributeWithoutDomain = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
];

export const jsonldDomainWithoutAssignedUri = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/.well-known/id/class/1',
      },
    ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
];

export const jsonldDomainWithoutRange = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/property/1',
    },
    '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
    'http://www.w3.org/2000/01/rdf-schema#domain': [
      {
        '@id': 'http://example.org/.well-known/id/class/1',
      },
    ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
  },
];

export const jsonldRangeWithoutAssignedUri = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
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
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
  },
];

export const jsonldAttributeWithRange = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
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
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/class/1',
    },
  },
];

export const jsonldAttributeWithParent = [
  {
    '@id': 'http://example.org/.well-known/id/property/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
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
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#scope': {
      '@id': 'https://data.vlaanderen.be/id/concept/scope/InPackage',
    },
  },
];
