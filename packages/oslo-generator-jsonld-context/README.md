# `OSLO JSON-LD Context Generator`

> Given an OSLO-compliant RDF file, this tool generates a JSON-LD context file

## Install
```bash
npm install @oslo-flanders/jsonld-context-generator
```

## Usage

The service is executed from the CLI and expects the following parameters:
| Parameter | Description | Required | Possible values |
| --------- | --------- | ----------- | --------------- |
| `--input` | The URL or local file path of an OSLO-compliant RDF file | :heavy_check_mark: ||
| `--output` | The name of the output file | No, defaults to `context.jsonld` ||
| `--language` | The language in which the context must be generated (labels) | :heavy_check_mark: ||
| `--addDomainPrefix` | Prefix every attribute with its domain | No | `true` or `false` (default) |
| `--silent` | Suppress log messages | No | `true` or `false` (default) |
