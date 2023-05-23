# OSLO Conversion Service

> Transforms an Enterprise Architect (EA) UML diagram to RDF (or a serialization)

## Install

```bash
npm install @oslo-flanders/ea-converter
```

## Usage
The service is executed from the CLI and expects the following parameters:
| Parameter | Description | Required | Possible values |
| --------- | --------- | ----------- | --------------- |
| `--umlFile` | The URL or local file path of an EA UML diagram | :heavy_check_mark: ||
| `--diagramName` | The name of the UML diagram within the EAP file | :heavy_check_mark: ||
| `--outputFile` | The name of the RDF output file | No, but if omitted, output is written to process.stdout ||
| `--specificationType` | The type of the specification | :heavy_check_mark: | `ApplicationProfile` or `Vocabulary` |
| `--versionId` | Version identifier for the document | :heavy_check_mark: ||
| `--outputFormat` | RDF content-type specifiying the output format | :heavy_check_mark: | `application/ld+json` |