import { DataFactory } from 'rdf-data-factory';

const factory = new DataFactory();

enum Prefixes {
  adms = 'http://www.w3.org/ns/adms#',
  cpov = 'http://data.europa.eu/m8g/',
  dcat = 'http://www.w3.org/ns/dcat#',
  dcterms = 'http://purl.org/dc/terms/',
  foaf = 'http://xmlns.com/foaf/0.1/',
  generiek = 'http://data.vlaanderen.be/ns/generiek#',
  geodcatap = 'http://data.europa.eu/930/',
  locn = 'http://www.w3.org/ns/locn#',
  mdcat = 'https://data.vlaanderen.be/ns/metadata-dcat#',
  mobilitydcatap = 'https://w3id.org/mobilitydcat-ap#',
  oslo = 'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#',
  owl = 'http://www.w3.org/2002/07/owl#',
  person = 'http://www.w3.org/ns/person#',
  prov = 'http://www.w3.org/ns/prov#',
  qb = 'http://purl.org/linked-data/cube#',
  rdf = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs = 'http://www.w3.org/2000/01/rdf-schema#',
  schema = 'https://schema.org/',
  shacl = 'http://www.w3.org/ns/shacl#',
  skos = 'http://www.w3.org/2004/02/skos/core#',
  time = 'http://www.w3.org/2006/time#',
  vann = 'http://purl.org/vocab/vann/',
  vcard = 'http://www.w3.org/2006/vcard/ns#',
  dcatap = 'http://data.europa.eu/r5r/',
  vl = 'https://data.vlaanderen.be/ns/shacl#',
  vlaanderen = 'https://data.vlaanderen.be/ns/',
  void = 'http://rdfs.org/ns/void#',
  xsd = 'http://www.w3.org/2001/XMLSchema#',
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
