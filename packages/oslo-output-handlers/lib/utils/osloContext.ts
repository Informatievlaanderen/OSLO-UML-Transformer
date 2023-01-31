export function getOsloContext(): any {
  return {
    '@context': {
      vlaanderen: 'http://data.vlaanderen.be/ns/',
      owl: 'http://www.w3.org/2002/07/owl#',
      void: 'http://rdfs.org/ns/void#',
      dcterms: 'http://purl.org/dc/terms/',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      dcat: 'http://www.w3.org/ns/dcat#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      qb: 'http://purl.org/linked-data/cube#',
      skos: 'http://www.w3.org/2004/02/skos/core#',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      foaf: 'http://xmlns.com/foaf/0.1/',
      person: 'http://www.w3.org/ns/person#',
      rec: 'http://www.w3.org/2001/02pd/rec54#',
      vann: 'http://purl.org/vocab/vann/',
      sh: 'http://w3.org/ns/shacl#',
      prov: 'http://www.w3.org/ns/prov#',
      packages: '@included',
      classes: '@included',
      datatypes: '@included',
      attributes: '@included',
      baseUri: 'http://example.org/baseUri',
      definition: {
        '@id': 'rdfs:comment',
        '@container': '@set',
      },
      label: {
        '@id': 'rdfs:label',
        '@container': '@set',
      },
      scope: {
        '@id': 'http://example.org/scope',
      },
      usageNote: {
        '@id': 'vann:usageNote',
        '@container': '@set',
      },
      domain: {
        '@id': 'rdfs:domain',
        '@container': '@set',
      },
      range: {
        '@id': 'rdfs:range',
      },
      minCount: {
        '@id': 'sh:minCount',
      },
      maxCount: {
        '@id': 'sh:maxCount',
      },
      parent: {
        '@id': 'rdfs:subClassOf',
        '@type': 'owl:Class',
      },
      generatedAtTime: {
        '@id': 'prov:generatedAtTime',
      },
      Package: 'http://example.org/Package',
      Class: {
        '@id': 'owl:Class',
      },
      DatatypeProperty: {
        '@id': 'owl:DatatypeProperty',
      },
      ObjectProperty: {
        '@id': 'owl:ObjectProperty',
      },
      authors: {
        '@type': 'foaf:Person',
        '@id': 'foaf:maker',
      },
      editors: {
        '@type': 'foaf:Person',
        '@id': 'rec:editor',
      },
      contributors: {
        '@type': 'foaf:Person',
        '@id': 'dcterms:contributor',
      },
      affiliation: {
        '@id': 'http://schema.org/affiliation',
      },
      subject: {
        '@id': 'rdf:subject',
      },
      predicate: {
        '@id': 'rdf:predicate',
      },
      object: {
        '@id': 'rdf:object',
      },
      Statement: {
        '@id': 'rdf:Statement',
      },
      assignedUri: {
        '@id': 'http://example.org/assignedUri',
      },
    },
  };
}
