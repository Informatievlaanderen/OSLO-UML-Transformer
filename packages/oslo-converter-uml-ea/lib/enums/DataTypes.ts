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
  let h: number = 0;
  for (let i = 0; i < uri.length; i++) {
    h = (Math.imul(31, h) + uri.charCodeAt(i)) | 0;
  }
  return h > 0 ? h : (h * - 1)
}
