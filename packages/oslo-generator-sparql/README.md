# `OSLO SPARQL Generator`

> Given an OSLO-compliant RDF file, this tool generates for each class a SPARQL query for it.

## Install
```bash
npm install @oslo-flanders/sparql-generator
```

## Global install
To use the service from the command line anywhere, you can install it globally.
```bash
npm install -g @oslo-flanders/sparql-generator
```

## API

The service is executed from the CLI and expects the following parameters:
| Parameter          | Description                                                  | Required           | Possible values             |
| ------------------ | ------------------------------------------------------------ | ------------------ | --------------------------- |
| `--input`          | The URL or local file path of an OSLO-compliant RDF file     | :heavy_check_mark: |                             |
| `--output`         | The name of the output directory to store query files in     | No                 |                             |
| `--language`       | The language in which the SPARQL must be generated (labels)  | No                 |                             |
| `--silent`         | Suppress log messages                                        | No                 | `true` or `false` (default) |

## Usage
```bash
oslo-generator-sparql --input report.jsonld --output queries --language nl
```
