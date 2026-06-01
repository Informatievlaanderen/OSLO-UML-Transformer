/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { ns } from '@oslo-flanders/core';
import fetch from 'node-fetch';

const PREFIX_CC_URL = 'https://prefix.cc/context';

export async function getPrefixes(): Promise<Record<string, string>> {
  const url = PREFIX_CC_URL;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch prefixes: ${response.statusText}`);
    }

    const data = (await response.json()) as Record<string, unknown>;
    if (data['@context']) {
      return data['@context'] as Record<string, string>;
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
/* eslint-enable @typescript-eslint/consistent-type-assertions */
