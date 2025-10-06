export function getOsloContext(): any {
  return {
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
    adms: 'http://www.w3.org/ns/adms#',
    packages: '@included',
    classes: '@included',
    datatypes: '@included',
    attributes: '@included',
    referencedEntities: '@included',
    baseURI: {
      '@id': 'oslo:baseURI',
      '@type': '@id',
    },
    vocDefinition: {
      '@id': 'oslo:vocDefinition',
      '@container': '@set',
    },
    apDefinition: {
      '@id': 'oslo:apDefinition',
      '@container': '@set',
    },
    vocLabel: {
      '@id': 'oslo:vocLabel',
      '@container': '@set',
    },
    apLabel: {
      '@id': 'oslo:apLabel',
      '@container': '@set',
    },
    diagramLabel: {
      '@id': 'oslo:diagramLabel',
    },
    scope: {
      '@id': 'oslo:scope',
    },
    vocUsageNote: {
      '@id': 'oslo:vocUsageNote',
      '@container': '@set',
    },
    apUsageNote: {
      '@id': 'oslo:apUsageNote',
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
    Package: 'oslo:Package',
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
    assignedURI: {
      '@id': 'oslo:assignedURI',
      '@type': '@id',
    },
    Datatype: {
      '@id': 'rdfs:Datatype',
    },
    codelist: {
      '@id': 'oslo:codelist',
      '@type': '@id',
    },
    status: {
      '@id': 'adms:status',
      '@type': '@id',
    },
    extensions: {
      '@id': 'oslo:extensions',
      '@container': '@set',
    },
  };
}
