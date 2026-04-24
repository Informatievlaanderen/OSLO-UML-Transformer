import { ns } from '@oslo-flanders/core';
import fetch from 'node-fetch';

const PREFIX_CC_URL = 'http://prefix.cc/context';
var _cachedPrefixes: Record<string,string>

export async function getPrefixes(): Promise<Record<string, string>> {
  if(_cachedPrefixes)
    return _cachedPrefixes
  const url = PREFIX_CC_URL;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch prefixes: ${response.statusText}`);
    }

    const data = await response.json();
    if (data['@context']) {
      _cachedPrefixes = fixPrefixes(data['@context'])
      return _cachedPrefixes;
    }
    throw new Error('Invalid context format received from prefix.cc');
  } catch (error: unknown) {
    console.warn(`Error fetching prefixes: ${String(error)}`);
    // Fallback to a minimal set of prefixes if the fetch fails
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
      mobilitydcatap: ns.mobilitydcatap('').value,
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
  }
}

function fixPrefixes(records: Record<string,string>): Record<string, string> {
  // mobilitydcat-ap is incorrectly mapped to mdcat in prefix.cc
  records.mdcat = ns.mdcat('').value
  records.mobilitydcatap = ns.mobilitydcatap('').value
  // missing value
  records.generiek = ns.generiek('').value
  // geodcatap is incorrectly defined in prefix.cc as "geodcat"
  delete records.geodcat
  records.geodcatap = ns.geodcatap('').value
  return records;
}