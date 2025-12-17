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
| `--applyFiltering` | Wether or not to apply filters on the generated output. The filters limit the generated classes, datatypes, entities and properties that will be shown to a certain scopes. If you just want all possible values, you can set the value to `false`. | No, default `true` | `true` or `false` |
| `--publicationEnvironment` | The base URI of environment where the document will be published | :heavy_check_mark: | |
| `--specificationType` | The type of specification | No, defaults to `Vocabulary` | `ApplicationProfile` or `Vocabulary`|
| `--allTags` | Whether or not to make a selection of key values for the generated classes, datatypes entities and properties. | No, default `false` | `true` or `false` |
| `--inheritance` | Add all properties from the superclass to the child class | No, default `false` | `true` or `false` |
| `--ignoreSkosConcept` | Ignore enumerations with SKOS Concept URI | No, default `false` | `true` or `false` |

## Usage

```bash
oslo-webuniversum-json-generator --input report.jsonld --language nl --publicationEnvironment https://data.vlaanderen.be
oslo-webuniversum-json-generator --input report.jsonld --language nl --applyFiltering false --publicationEnvironment https://data.vlaanderen.be
oslo-webuniversum-json-generator --input report.jsonld --language nl --applyFiltering false --publicationEnvironment https://data.vlaanderen.be --specificationType ApplicationProfile
oslo-webuniversum-json-generator --input report.jsonld --language nl --applyFiltering false --publicationEnvironment https://data.vlaanderen.be --specificationType ApplicationProfile --allTags true --inheritance true --ignoreSkosConcept true
```
