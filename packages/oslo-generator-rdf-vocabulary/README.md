# `OSLO RDF Vocabulary Generator`

> Given an OSLO-compliant RDF file, this tool generates an RDF vocabulary

## Install
```bash
npm install @oslo-flanders/rdf-vocabulary-generator
```

## Global install
To use the service from the command line anywhere, you can install it globally.
```bash
npm install -g @oslo-flanders/rdf-vocabulary-generator
```

## API

The service is executed from the CLI and expects the following parameters:
| Parameter | Description | Required | Possible values |
| --------- | --------- | ----------- | --------------- |
| `--input` | The URL or local file path of an OSLO-compliant RDF file | :heavy_check_mark: ||
| `--output` | The name of the output file | :heavy_check_mark: ||
| `--language` | The language in which the rdf vocabulary must be generated (labels) | :heavy_check_mark: ||
| `--contentType` | Prefix every attribute with its domain | No | `text/turtle`, `application/n-quads`, `application/n-triples`, `application/ld+json` |
| `--silent` | Suppress log messages | No | `true` or `false` (default) |

## Usage
```bash
oslo-generator-rdf --input report.jsonld --output report.ttl --language nl --contentType text/turtle
oslo-generator-rdf --input report.jsonld --output report.ttl --language nl --contentType application/n-quads
```