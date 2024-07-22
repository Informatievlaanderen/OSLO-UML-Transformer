# `OSLO HTML Generator`

> Given an OSLO-compliant RDF file, this tool generates an HTML file with the HTML layout

## Install

```
npm install @oslo-flanders/html-generator
```

## Global install

To use the service from the command line anywhere, you can install it globally.

```bash
npm install -g @oslo-flanders/html-generator
```

## API

The service is executed from the CLI and expects the following parameters:
| Parameter | Description | Required | Possible values |
| --------- | --------- | ----------- | --------------- |
| `--input` | The URL or local file path of an OSLO-compliant RDF file | :heavy_check_mark: ||
| `--output` | The name of the output file | No, defaults to `context.jsonld` ||
| `--stakeholders` | The URL or local file path to the stakeholders json | :heavy_check_mark: ||
| `--metadata` | The URL or local file path of the metadata config file | :heavy_check_mark: ||
| `--specificationType` | The type of specification | No, defaults to `Vocabulary` | `ApplicationProfile` or `Vocabulary`|
| `--specificationName` | Title of the document | No ||
| `--language` | The language in which the HTML file must be generated (labels) | :heavy_check_mark: ||
| `--silent` | Suppress log messages | No | `true` or `false` (default) |

## Usage

```bash
oslo-generator-html --input webuniversum-config.json --language nl --stakeholders stakeholders.json --metadata metadata.json
oslo-generator-html --input webuniversum-config.json --language nl --specificationType ApplicationProfile --specificationName "OSLO-Verkeersmetingen" --stakeholders stakeholders.json --metadata metadata.json
```
