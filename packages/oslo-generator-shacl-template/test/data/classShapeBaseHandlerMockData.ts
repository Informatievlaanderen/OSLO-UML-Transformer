export const baseData = {
  '@id': 'http://example.org/.well-known/id/class/1',
  '@type': 'http://www.w3.org/2000/01/rdf-schema#Class',
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
    '@id': 'http://example.org/id/class/1',
  },
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocLabel': {
    '@value': 'myLabel',
    '@language': 'nl',
  },
  'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDefinition': {
    '@value': 'myDescription',
    '@language': 'nl',
  },
};

export const baseDataWithoutAssignedURI = {
  '@id': 'http://example.org/.well-known/id/class/1',
  '@type': 'http://www.w3.org/2000/01/rdf-schema#Class',
};
