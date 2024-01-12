const rdf = 'http://www.w3.org/1999/02/22-rdf-syntax-ns';
const rdfs = 'http://www.w3.org/2000/01/rdf-schema';
const xsd = 'http://www.w3.org/2001/XMLSchema';

export const DataTypes: Map<string, string> = new Map<string, string>(
  [
    ['String', `${xsd}#string`],
    ['Date', `${xsd}#date`],
    ['Time', `${xsd}#time`],
    ['DateTime', `${xsd}#dateTime`],
    ['Int', `${xsd}#xint`],
    ['Integer', `${xsd}#integer`],
    ['Decimal', `${xsd}#decimal`],
    ['Double', `${xsd}#xdouble`],
    ['Boolean', `${xsd}#xboolean`],
    ['LangString', `${rdf}#langString`],
    ['Literal', `${rdfs}#Literal`],
    ['Year', `${xsd}#gYear`],
    ['YearMonth', `${xsd}#gYearMonth`],
    ['Month', `${xsd}#gMonth`],
    ['MonthDay', `${xsd}#gMonthDay`],
    ['Duration', `${xsd}#duration`],
    ['HTML', `${rdf}#HTML`],
    ['URI', `${xsd}#anyURI`],
  ],
);

export const datatypeIdentifierToHash = (uri: string): number => {
  let hash = 0;
  for (let i = 0; i < uri.length; i++) {
    hash = Math.trunc(Math.imul(31, hash) + uri.charCodeAt(i));
  }
  return hash > 0 ? hash : hash * -1;
};
