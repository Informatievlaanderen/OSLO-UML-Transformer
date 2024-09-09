export const jsonldClass = [
  {
    '@id': 'http://example.org/.well-known/id/package/1',
    '@type':
      'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#Package',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI':
      'http://example.org/ns/domain',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#baseURI':
      'http://example.org/ns/domain#',
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
        '@value': 'ApTestClass',
      },
    ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocLabel': [
      {
        '@language': 'en',
        '@value': 'VocTestClass',
      },
    ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocDefinition':
      [
        {
          '@language': 'en',
          '@value': 'VocDefinition',
        },
      ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDefinition': [
      {
        '@language': 'en',
        '@value': 'ApDefinition',
      },
    ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocUsageNote': [
      {
        '@language': 'en',
        '@value': 'VocUsageNote',
      },
    ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apUsageNote': [
      {
        '@language': 'en',
        '@value': 'ApUsageNote',
      },
    ],
  },
  {
    '@id': 'http://example.org/.well-known/id/datatype/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://example.org/id/datatype/1',
    },
    '@type': 'http://www.w3.org/2000/01/rdf-schema#Datatype',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'ApDatatype',
      },
    ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocLabel': [
      {
        '@language': 'en',
        '@value': 'VocDatatype',
      },
    ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocDefinition':
      [
        {
          '@language': 'en',
          '@value': 'VocDatatypeDefinition',
        },
      ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDefinition': [
      {
        '@language': 'en',
        '@value': 'ApDatatypeDefinition',
      },
    ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocUsageNote': [
      {
        '@language': 'en',
        '@value': 'VocDatatypeUsageNote',
      },
    ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apUsageNote': [
      {
        '@language': 'en',
        '@value': 'ApDatatypeUsageNote',
      },
    ],
  },
];

export const dataWithoutPackage = [];
export const dataWithoutPackageBaseURI = [
  {
    '@id': 'http://example.org/.well-known/id/package/1',
    '@type':
      'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#Package',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI':
      'http://example.org/ns/domain',
  },
];

export const classWithoutAssignedURI = [
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
  },
];

export const packageSubject = [
  {
    '@context': {
      oslo: 'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#',
      owl: 'http://www.w3.org/2002/07/owl#',
      dcterms: 'http://purl.org/dc/terms/',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      skos: 'http://www.w3.org/2004/02/skos/core#',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      foaf: 'http://xmlns.com/foaf/0.1/',
      rec: 'http://www.w3.org/2001/02pd/rec54#',
      sh: 'http://www.w3.org/ns/shacl#',
      prov: 'http://www.w3.org/ns/prov#',
      packages: '@included',
      classes: '@included',
      datatypes: '@included',
      attributes: '@included',
      referencedEntities: '@included',
      baseURI: {
        '@id': 'oslo:baseURI',
        '@type': '@id',
      },
      Package: 'oslo:Package',
    },
    '@id': 'https://data.vlaanderen.be/test/1',
    packages: [
      {
        '@id':
          'urn:oslo-toolchain:5f1bceb6068f320387bfb5109c1e95804e880796b47c7af5a6b7f21b0cd22ee0',
        '@type': 'Package',
        assignedURI: 'https://data.vlaanderen.be/test/',
        baseURI: 'https://data.vlaanderen.be/test/',
      },
    ],
  },
];

export const classWithProperty = [
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
        '@value': 'ApAnotherTestClass',
      },
    ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocLabel': [
      {
        '@language': 'en',
        '@value': 'VocAnotherTestClass',
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
    'http://w3.org/ns/shacl#minCount': '1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#codelist':
      'http://example.org/codelist/1',
  },
];

export const classWithPropertyWithoutRange = [
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
    'http://w3.org/ns/shacl#maxCount': '*',
  },
];

export const classWithPropertyWithoutRangeAssignedURI = [
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
];

export const classWithParent = [
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
    'http://www.w3.org/2000/01/rdf-schema#subClassOf': {
      '@id': 'http://example.org/.well-known/id/class/2',
    },
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
        '@value': 'ApAnotherTestClass',
      },
    ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocLabel': [
      {
        '@language': 'en',
        '@value': 'VocAnotherTestClass',
      },
    ],
  },
];

export const classWithParentWithoutAssignedURI = [
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    '@type': 'http://www.w3.org/2002/07/owl#Class',
  },
];

export const dataWithRangeCodelist = [
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
      '@id': 'http://example.org/.well-known/id/class/1',
    },
    'http://w3.org/ns/shacl#maxCount': '*',
  },
  {
    '@id': 'http://example.org/.well-known/id/class/1',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
      '@id': 'http://www.w3.org/2004/02/skos/core#Concept',
    },
    '@type': 'http://www.w3.org/2002/07/owl#Class',
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
      {
        '@language': 'en',
        '@value': 'TestClass',
      },
    ],
    'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#codelist': {
      '@id': 'http://example.org/codelist/1',
    },
  },
];
