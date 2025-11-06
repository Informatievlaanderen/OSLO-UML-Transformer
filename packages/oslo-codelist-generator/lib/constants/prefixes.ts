import fetch from 'node-fetch';

const PREFIX_CC_URL = 'https://prefix.cc/context';

export async function getPrefixes(): Promise<Record<string, string>> {
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
    console.error(`Error fetching prefixes: ${String(error)}`);
    // Fallback to a minimal set of prefixes if the fetch fails
    return {
      skos: 'http://www.w3.org/2004/02/skos/core#',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      dct: 'http://purl.org/dc/terms/',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
    };
  }
}
