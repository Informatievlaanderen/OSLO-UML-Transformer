# Validate IRI

[![Build status](https://github.com/comunica/validate-iri.js/workflows/CI/badge.svg)](https://github.com/comunica/validate-iri.js/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/comunica/validate-iri.js/badge.svg?branch=master)](https://coveralls.io/github/comunica/validate-iri.js?branch=master)
[![npm version](https://badge.fury.io/js/validate-iri.svg)](https://www.npmjs.com/package/validate-iri)

This tool validates an IRI, either using strict RFC 3987 grammar, or using a faster but less strict pragmatic validation mode.
It works in both JavaScript and TypeScript.

## Installation

```bash
$ npm install validate-iri
```
or
```bash
$ yarn add validate-iri
```

This package also works out-of-the-box in browsers via tools such as [webpack](https://webpack.js.org/) and [browserify](http://browserify.org/).

## Usage

Multiple validation modes are provided:
- `IriValidationStrategy.Strict`: carefully validates the IRI using RFC 3987 grammar. This is the default value.
- `IriValidationStrategy.Pragmatic`: quickly validates that the IRI has a valid scheme and does not contain any character forbidden by the N-Triples, Turtle and N3 grammars.
- `IriValidationStrategy.None`: does not validate the IRI at all.

Example:
```
import { validateIri, IriValidationStrategy } from 'validate-iri`
const yourIri = 'https://example.com/john-doe'
validateIri(yourIri, IriValidationStrategy.Pragmatic) // Will throw an error if the IRI is invalid.
```

## Performance

When using strict validation mode, a significant performance overhead should be taken into account.
In isolation, strict validation is an order of magnitude slower than pragmatic validation.

When used in a parser such as [rdfxml-streaming-parser.js](https://github.com/rdfjs/rdfxml-streaming-parser.js/), the performance impact on parsing is the following (GeoSpecies Knowledge Base with 1.8M triples):

- Strict validation: 12.053s
- Pragmatic validation: 9.116s
- No validation: 8.338s

## License

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
