export const singleStatement = {
  '@context': {
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    example: 'http://example.org/',
    vann: 'http://purl.org/vocab/vann/',
    'rdf:subject': {
      '@type': '@id',
    },
    'rdf:predicate': {
      '@type': '@id',
    },
    'rdf:object': {
      '@type': '@id',
    },
  },
  '@id': 'http://example.org/id/statement/1',
  '@type': 'rdf:Statement',
  'rdf:subject': 'http://example.org/id/class/1',
  'rdf:predicate': 'http://example.org/examplePredicate',
  'rdf:object': 'http://example.org/id/class/2',
  'example:assignedUri': 'http://example.org/1',
  'rdfs:label': 'TestLabel',
  'rdfs:comment': {
    '@language': 'en',
    '@value': 'A comment',
  },
  'vann:usageNote': {
    '@language': 'en',
    '@value': 'A usage note',
  },
};

export const multipleStatements = [
  {
    '@context': {
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      'rdf:subject': {
        '@type': '@id',
      },
      'rdf:predicate': {
        '@type': '@id',
      },
      'rdf:object': {
        '@type': '@id',
      },
    },
    '@graph': [
      {
        '@id': 'http://example.org/id/statement/1',
        '@type': 'rdf:Statement',
        'rdf:subject': 'http://example.org/id/class/1',
        'rdf:predicate': 'http://example.org/examplePredicate',
        'rdf:object': 'http://example.org/id/class/2',
      },
      {
        '@id': 'http://example.org/id/statement/2',
        '@type': 'rdf:Statement',
        'rdf:subject': 'http://example.org/id/class/1',
        'rdf:predicate': 'http://example.org/examplePredicate',
        'rdf:object': 'http://example.org/id/class/2',
      },
    ],
  },
];

export const dataWithAssignedUri = {
  '@context': {
    oslo: 'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#',
    'oslo:assignedURI': {
      '@type': '@id',
    },
  },
  '@id': 'http://example.org/id/class/1',
  'oslo:assignedURI': 'http://example.org/1',
};

export const dataWithLabels = {
  '@context': {
    oslo: 'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#',
  },
  '@id': 'http://example.org/id/class/1',
  'oslo:vocLabel': [
    {
      '@language': 'nl',
      '@value': 'TestLabel',
    },
    {
      '@language': 'en',
      '@value': 'AnotherTestLabel',
    },
  ],
  'oslo:apLabel': [
    {
      '@language': 'nl',
      '@value': 'TestLabel',
    },
    {
      '@language': 'en',
      '@value': 'AnotherTestLabel',
    },
  ],
  'oslo:diagramLabel': [
    {
      '@value': 'TestLabel',
    },
  ],
};

export const dataWithDefinitions = {
  '@context': {
    oslo: 'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#',
  },
  '@id': 'http://example.org/id/class/1',
  'oslo:vocDefinition': [
    {
      '@language': 'nl',
      '@value': 'A comment',
    },
    {
      '@language': 'en',
      '@value': 'Another comment',
    },
  ],
  'oslo:apDefinition': [
    {
      '@language': 'nl',
      '@value': 'A comment',
    },
    {
      '@language': 'en',
      '@value': 'Another comment',
    },
  ],
};

export const dataWithDefinitionInStatementsWithoutLanguageTag = {
  '@context': {
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    'rdf:subject': {
      '@type': '@id',
    },
    'rdf:predicate': {
      '@type': '@id',
    },
    'rdf:object': {
      '@type': '@id',
    },
  },
  '@id': 'http://example.org/id/statement/1',
  '@type': 'rdf:Statement',
  'rdf:subject': 'http://example.org/id/class/1',
  'rdf:predicate': 'http://example.org/examplePredicate',
  'rdf:object': 'http://example.org/id/class/2',
  'rdfs:comment': 'A comment',
};

export const dataWithClassParents = {
  '@context': {
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    'rdfs:subClassOf': {
      '@type': '@id',
    },
  },
  '@id': 'http://example.org/id/class/1',
  'rdfs:subClassOf': [
    {
      '@id': 'http://example.org/id/class/2',
    },
    {
      '@id': 'http://example.org/id/class/3',
    },
  ],
};

export const dataWithPropertyParent = {
  '@context': {
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    'rdfs:subPropertyOf': {
      '@type': '@id',
    },
  },
  '@id': 'http://example.org/id/property/1',
  'rdfs:subPropertyOf': 'http://example.org/id/property/2',
};

export const dataWithRange = {
  '@context': {
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    'rdfs:range': {
      '@type': '@id',
    },
  },
  '@id': 'http://example.org/id/property/1',
  'rdfs:range': 'http://example.org/id/property/2',
};

export const dataWithDomain = {
  '@context': {
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    'rdfs:domain': {
      '@type': '@id',
    },
  },
  '@id': 'http://example.org/id/property/1',
  'rdfs:domain': 'http://example.org/id/class/1',
};

export const dataWithUsageNotes = {
  '@context': {
    oslo: 'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#',
  },
  '@id': 'http://example.org/id/class/1',
  'oslo:vocUsageNote': [
    {
      '@language': 'nl',
      '@value': 'A usage note',
    },
    {
      '@language': 'en',
      '@value': 'Another usage note',
    },
  ],
  'oslo:apUsageNote': [
    {
      '@language': 'nl',
      '@value': 'A usage note',
    },
    {
      '@language': 'en',
      '@value': 'Another usage note',
    },
  ],
};

export const dataWithCodelist = {
  '@context': {
    oslo: 'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#',
    'oslo:codelist': {
      '@type': '@id',
    },
  },
  '@id': 'http://example.org/id/property/1',
  'oslo:codelist': 'http://example.org/id/conceptscheme/A',
};
