import { ns } from '@oslo-flanders/core';
import fetch from 'node-fetch';

const PREFIX_CC_URL = 'https://prefix.cc/context';

export async function getPrefixes(): Promise<Record<string, string>> {
  return {
    adms: ns.adms('').value,
    cpov: ns.cpov('').value,
    dcat: ns.dcat('').value,
    dcatap: ns.dcatap('').value,
    dct: ns.dcterms('').value,
    dcterms: ns.dcterms('').value,
    foaf: ns.foaf('').value,
    generiek: ns.generiek('').value,
    geodcatap: ns.geodcatap('').value,
    locn: ns.locn('').value,
    mdcat: ns.mdcat('').value,
    oslo: ns.oslo('').value,
    owl: ns.owl('').value,
    person: ns.person('').value,
    prov: ns.prov('').value,
    qb: ns.qb('').value,
    rdf: ns.rdf('').value,
    rdfs: ns.rdfs('').value,
    schema: ns.schema('').value,
    shacl: ns.shacl('').value,
    skos: ns.skos('').value,
    time: ns.time('').value,
    vann: ns.vann('').value,
    vcard: ns.vcard('').value,
    vl: ns.vl('').value,
    vlaanderen: ns.vlaanderen('').value,
    void: ns.void('').value,
    xsd: ns.xsd('').value,
  };

  const url = PREFIX_CC_URL;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch prefixes: ${response.statusText}`);
    }

    const data = await response.json();
    if (data['@context']) {
      return data['@context'];
    }
    throw new Error('Invalid context format received from prefix.cc');
  } catch (error: unknown) {
    console.warn(`Error fetching prefixes: ${String(error)}`);
    // Fallback to a minimal set of prefixes if the fetch fails
    return {
      skos: ns.skos('').value,
      rdf: ns.rdf('').value,
      rdfs: ns.rdfs('').value,
      dct: ns.dcterms('').value,
      xsd: ns.xsd('').value,
      cpov: ns.cpov('').value,
      locn: ns.locn('').value,
    };
  }
}
