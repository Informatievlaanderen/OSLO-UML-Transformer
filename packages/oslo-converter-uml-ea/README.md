# OSLO Conversion Service

> Transforms an Enterprise Architect (EA) UML diagram to RDF (or a serialization)

## Install

```bash
npm install @oslo-flanders/ea-converter
```

## Global install

To use the service from the command line anywhere, you can install it globally.

```bash
npm install -g @oslo-flanders/ea-converter
```

## API

The service is executed from the CLI and expects the following parameters:
| Parameter | Description | Required | Possible values |
| --------- | --------- | ----------- | --------------- |
| `--umlFile` | The URL or local file path of an EA UML diagram | :heavy_check_mark: ||
| `--diagramName` | The name of the UML diagram within the EAP file | :heavy_check_mark: ||
| `--publicationEnvironment` | The base URI of environment where the document will be published | :heavy_check_mark: | |
| `--versionId` | Version identifier for the document | :heavy_check_mark: ||
| `--outputFile` | The name of the RDF output file | No, but if omitted, output is written to process.stdout ||
| `--outputFormat` | RDF content-type specifiying the output format | :heavy_check_mark: | `application/ld+json` |

## Usage

```bash
oslo-converter-ea --umlFile path/to/uml/diagram.eap --diagramName "diagramName" --versionId "test/1" --outputFile path/to/output.jsonld --outputFormat application/ld+json --publicationEnvironment https://data.vlaanderen.be
oslo-converter-ea --umlFile https://github.com/path/to/uml/diagram.eap --diagramName "My UML diagram" --versionId "test/1" --outputFormat application/ld+json --publicationEnvironment https://data.vlaanderen.be
```
