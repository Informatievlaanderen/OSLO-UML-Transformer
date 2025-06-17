export const context = {
  foaf: 'http://xmlns.com/foaf/0.1/',
  Person: {
    '@id': 'foaf:Person'
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
