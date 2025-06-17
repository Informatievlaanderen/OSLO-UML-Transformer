export const context = {
  foaf: 'http://xmlns.com/foaf/0.1/',
  dcterms: 'http://purl.org/dc/terms/',
  schema: 'https://schema.org/',
  Person: {
    '@id': 'foaf:Person'
  }, 
  authors: {
    '@type': 'foaf:Person',
    '@id': 'foaf:maker',
  },
  editors: {
    '@type': 'foaf:Person',
    '@id': 'schema:editor',
  },
  contributors: {
    '@type': 'foaf:Person',
    '@id': 'dcterms:contributor',
  },
  affiliation: {
    '@id': 'schema:affiliation',
  },
  firstName: {
    '@id': 'foaf:firstName',
  },
  lastName: {
    '@id': 'foaf:lastName',
  },
  affiliationName: {
    '@id': 'foaf:name',
  },
  homepage: {
    '@id': 'foaf:homepage',
  },
  email: {
    '@id': 'foaf:mbox',
  },
};
