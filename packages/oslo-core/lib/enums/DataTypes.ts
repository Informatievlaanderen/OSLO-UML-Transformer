const rdf = 'http://www.w3.org/1999/02/22-rdf-syntax-ns';
const rdfs = 'http://www.w3.org/2000/01/rdf-schema';
const xsd = 'http://www.w3.org/2001/XMLSchema';

const DataTypes: Map<string, string> = new Map<string, string>([
  ['string', `${xsd}#string`],
  ['date', `${xsd}#date`],
  ['time', `${xsd}#time`],
  ['datetime', `${xsd}#dateTime`],
  ['int', `${xsd}#int`],
  ['integer', `${xsd}#integer`],
  ['decimal', `${xsd}#decimal`],
  ['float', `${xsd}#float`],
  ['double', `${xsd}#double`],
  ['boolean', `${xsd}#boolean`],
  ['langstring', `${rdf}#langString`],
  ['literal', `${rdfs}#Literal`],
  ['year', `${xsd}#gYear`],
  ['yearmonth', `${xsd}#gYearMonth`],
  ['month', `${xsd}#gMonth`],
  ['monthday', `${xsd}#gMonthDay`],
  ['duration', `${xsd}#duration`],
  ['html', `${rdf}#HTML`],
  ['uri', `${xsd}#anyURI`],
  ['json', `${rdf}#JSON`],
  ['short', `${xsd}#long`],
  ['short', `${xsd}#short`],
  ['byte', `${xsd}#byte`],
  ['hexbinary', `${xsd}#hexBinary`],
  ['base64binary', `${xsd}#base64Binary`],
  ['nonnegativeinteger', `${xsd}#nonNegativeInteger`],
  ['nonpositiveinteger', `${xsd}#nonPositiveInteger`],
  ['negativeinteger', `${xsd}#negativeInteger`],
  ['positiveinteger', `${xsd}#positiveInteger`],
  ['unsignedshort', `${xsd}#unsignedLong`],
  ['unsignedshort', `${xsd}#unsignedShort`],
  ['unsignedbyte', `${xsd}#unsignedByte`],
]);

export const getDataType = (key: string): string | undefined =>
  DataTypes.get(key.toLowerCase());

export const datatypeIdentifierToHash = (uri: string): number => {
  let hash = 0;
  for (let i = 0; i < uri.length; i++) {
    hash = Math.trunc(Math.imul(31, hash) + uri.charCodeAt(i));
  }
  return hash > 0 ? hash : hash * -1;
};

export const isStandardDatatype = (uri: string): boolean =>
  Array.from(DataTypes.values()).includes(uri);
