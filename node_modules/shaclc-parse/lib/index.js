const ShaclcParser = require('./ShaclcParser').Parser;
const N3 = require('n3');

class Parser {
  constructor() {
  }

  parse(str, { extendedSyntax, baseIRI } = {}) {
    this._parser = new ShaclcParser();

    this._parser.Parser.factory = N3.DataFactory;
    this._parser.Parser.base = N3.DataFactory.namedNode(baseIRI || 'urn:x-base:default');
    this._parser.Parser.extended = extendedSyntax === true;
    this._parser.Parser.prefixes = {
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      sh: 'http://www.w3.org/ns/shacl#',
      xsd: 'http://www.w3.org/2001/XMLSchema#'
    }
    this._parser.Parser.currentNodeShape = undefined;
    this._parser.Parser.currentPropertyNode = undefined;
    this._parser.Parser.nodeShapeStack = [];
    this._parser.Parser.tempCurrentNodeShape = undefined;
    this._parser.Parser.n3Parser = new N3.Parser({ baseIRI: baseIRI || 'urn:x-base:default' });

    const arr = []
    this._parser.Parser.onQuad = (quad) => { arr.push(quad) };
    this._parser.parse(str);
    arr.prefixes = this._parser.Parser.prefixes;
    return arr;
  }
}

module.exports.Parser = Parser;

module.exports.parse = function parse(str, options) {
  const parser = new Parser();
  return parser.parse(str, options)
}
