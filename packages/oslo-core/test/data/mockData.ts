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
    example: 'http://example.org/',
    'example:assignedUri': {
      '@type': '@id',
    },
  },
  '@id': 'http://example.org/id/class/1',
  'example:assignedUri': 'http://example.org/1',
};

export const dataWithLabels = {
  '@context': {
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  },
  '@id': 'http://example.org/id/class/1',
  'rdfs:label': [
    {
      '@language': 'nl',
      '@value': 'TestLabel',
    },
    {
      '@language': 'en',
      '@value': 'AnotherTestLabel',
    },
  ],
};

export const dataWithDefinitions = {
  '@context': {
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  },
  '@id': 'http://example.org/id/class/1',
  'rdfs:comment': [
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
    vann: 'http://purl.org/vocab/vann/',
  },
  '@id': 'http://example.org/id/class/1',
  'vann:usageNote': [
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

export const dataWitUsageNoteInStatementsWithoutLanguageTag = {
  '@context': {
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
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
  'vann:usageNote': 'A usage note',
};
