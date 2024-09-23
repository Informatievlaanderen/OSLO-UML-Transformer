# `oslo-generator-json-webuniversum` OSLO JSON Webuniversum Generator

> This package transforms an OSLO JSON-LD file into a JSON configuration file which will be used by the Nuxt.JS Service to render vocabularies and application profiles

## Install

```bash
npm install @oslo-flanders/json-webuniversum-generator
```

## Global install

```bash
npm install -g @oslo-flanders/json-webuniversum-generator
```

## API

The service is executed from the CLI and expects the following parameters:
| Parameter | Description | Required | Possible values |
| ---------- | ----------------------------------------------------------- | --------------------------------- | --------------- |
| `--input` | The URL or local file path of an OSLO stakeholders csv file |:heavy_check_mark: | |
| `--output` | Name of the output file | No, default `webuniversum-config.json` | |
| `--language` | The language in which the config must be generated | :heavy_check_mark: | |
| `--applyFiltering` | Wether or not to apply filters on the generated output. The filters are used for the OSLO-frontend application(s) | No, default `true` | `true` or `false` |
| `--publicationEnvironment` | The base URI of environment where the document will be published | :heavy_check_mark: | |

## Usage

```bash
oslo-webuniversum-json-generator --input report.jsonld --language nl --publicationEnvironment https://data.vlaanderen.be
oslo-webuniversum-json-generator --input report.jsonld --language nl --applyFiltering false --publicationEnvironment https://data.vlaanderen.be
```
