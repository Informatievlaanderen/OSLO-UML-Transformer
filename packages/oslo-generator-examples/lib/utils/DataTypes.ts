import type { ExampleProperty } from '../interfaces/ExampleProperty';

const XML_SCHEMA_PREFIX = 'http://www.w3.org/2001/XMLSchema#';
const RDF_LANG_STRING = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString';

export function mapDataTypes(
  val: string,
  language: string,
): string | ExampleProperty {
  switch (true) {
    case val.startsWith(XML_SCHEMA_PREFIX):
      return `{{${val.slice(XML_SCHEMA_PREFIX.length).toUpperCase()}}}`;
    case val === RDF_LANG_STRING:
      return { [language]: '{{STRING}}' };
    default:
      return '{{VAL}}';
  }
}
