# `OSLO RDF Vocabulary Generator`

> Given an OSLO-compliant RDF file, this tool generates an RDF vocabulary

## Install
```bash
npm install @oslo-flanders/rdf-vocabulary-generator
```

## Usage

The service is executed from the CLI and expects the following parameters:
| Parameter | Description | Required | Possible values |
| --------- | --------- | ----------- | --------------- |
| `--input` | The URL or local file path of an OSLO-compliant RDF file | :heavy_check_mark: ||
| `--output` | The name of the output file | :heavy_check_mark: ||
| `--language` | The language in which the rdf vocabulary must be generated (labels) | :heavy_check_mark: ||
| `--contentType` | Prefix every attribute with its domain | :heavy_check_mark: | All RDF serializations |
| `--silent` | Suppress log messages | No | `true` or `false` (default) |