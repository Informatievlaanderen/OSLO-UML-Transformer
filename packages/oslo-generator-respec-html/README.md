# `OSLO HTML ReSpec Generator`

> Given an OSLO-compliant RDF file, this tool generates an HTML file with the ReSpec layout

## Note
This tool has not been thoroughly tested and is primarily used as a visual validation tool!

## Install
```
npm install @oslo-flanders/html-respec-generator
```

## Usage
The service is executed from the CLI and expects the following parameters:
| Parameter | Description | Required | Possible values |
| --------- | --------- | ----------- | --------------- |
| `--input` | The URL or local file path of an OSLO-compliant RDF file | :heavy_check_mark: ||
| `--output` | The name of the output file | No, defaults to `context.jsonld` ||
| `--specificationType` | The type of specification | No, defaults to `Vocabulary` | `ApplicationProfile` or `Vocabulary`|
| `--specificationName` | Title of the document | No ||
| `--language` | The language in which the HTML file must be generated (labels) | :heavy_check_mark: ||
| `--silent` | Suppress log messages | No | `true` or `false` (default) |
