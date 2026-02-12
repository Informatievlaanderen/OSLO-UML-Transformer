# `OSLO RML Mapping Generator`

> Given an OSLO-compliant RDF file, this tool generates for each class a RML mapping template from it.

## Install
```bash
npm install @oslo-flanders/rml-template-generator
```

## Global install
To use the service from the command line anywhere, you can install it globally.
```bash
npm install -g @oslo-flanders/rml-template-generator
```

## API

The service is executed from the CLI and expects the following parameters:
| Parameter          | Description                                                          | Required           | Possible values             |
| ------------------ | -------------------------------------------------------------------- | ------------------ | --------------------------- |
| `--input`          | The URL or local file path of an OSLO-compliant RDF file             | :heavy_check_mark: |                             |
| `--mapping`        | The URL or local file path of a mapping configuration file           | :heavy_check_mark: |                             |
| `--output`         | The name of the output directory to store mapping templates files in | No                 |                             |
| `--language`       | The language in which the RML mapping must be generated (labels)     | No                 |                             |
| `--silent`         | Suppress log messages                                                | No                 | `true` or `false` (default) |

## Usage
```bash
oslo-generator-rml-template --input report.jsonld --mapping mapping.json --output mappings --language nl
```
