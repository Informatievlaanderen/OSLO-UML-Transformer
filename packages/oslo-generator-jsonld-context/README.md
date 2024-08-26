# `OSLO JSON-LD Context Generator`

> Given an OSLO-compliant RDF file, this tool generates a JSON-LD context file

## Install
```bash
npm install @oslo-flanders/jsonld-context-generator
```

## Global install
To use the service from the command line anywhere, you can install it globally.
```bash
npm install -g @oslo-flanders/jsonld-context-generator
```

## API

The service is executed from the CLI and expects the following parameters:
| Parameter | Description | Required | Possible values |
| --------- | --------- | ----------- | --------------- |
| `--input` | The URL or local file path of an OSLO-compliant RDF file | :heavy_check_mark: ||
| `--output` | The name of the output file | No, defaults to `context.jsonld` ||
| `--language` | The language in which the context must be generated (labels) | :heavy_check_mark: ||
| `--addDomainPrefix` | Prefix every attribute with its domain | No | `true` or `false` (default) |
| `--silent` | Suppress log messages | No | `true` or `false` (default) |
| `--scopedContext` | Boolean that decides to keep the @context scoped or not | No | `true` or `false` (default) |

## Usage
```bash
oslo-jsonld-context-generator --input report.jsonld --language nl
oslo-jsonld-context-generator --input https://data.vlaanderen.be/ns/adres.jsonld --language nl
oslo-jsonld-context-generator --input https://data.vlaanderen.be/ns/adres.jsonld --output context.jsonld --language nl --scopedContext true
```