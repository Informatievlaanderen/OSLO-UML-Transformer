import { DataFactory } from 'rdf-data-factory';

const factory = new DataFactory();

enum Prefixes {
  adms = 'http://www.w3.org/ns/adms#',
  dcat = 'http://www.w3.org/ns/dcat#',
  dcterms = 'http://purl.org/dc/terms/',
  foaf = 'http://xmlns.com/foaf/0.1/',
  owl = 'http://www.w3.org/2002/07/owl#',
  vlaanderen = 'https://data.vlaanderen.be/ns/',
  void = 'http://rdfs.org/ns/void#',
  rdf = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs = 'http://www.w3.org/2000/01/rdf-schema#',
  qb = 'http://purl.org/linked-data/cube#',
  skos = 'http://www.w3.org/2004/02/skos/core#',
  xsd = 'http://www.w3.org/2001/XMLSchema#',
  person = 'http://www.w3.org/ns/person#',
  vann = 'http://purl.org/vocab/vann/',
  shacl = 'http://w3.org/ns/shacl#',
  prov = 'http://www.w3.org/ns/prov#',
  oslo = 'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#'
}

export type Namespace = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [T in keyof typeof Prefixes]: Function;
};

const vocab = (): Namespace => {
  const namespaces: any = {};
  for (const prefix in Prefixes) {
    const expansion = <string>(<any>Prefixes)[prefix];
    namespaces[prefix] = (localName = '') => factory.namedNode(expansion + localName);
  }

  return <Namespace>namespaces;
};

export const ns = vocab();
