# OSLO Stakeholders Conversion Service

> Transforms an OSLO stakeholders csv file to JSON-LD

## Install
```bash
npm install @oslo-flanders/stakeholders-converter
```

## Usage

The service is executed from the CLI and expects the following parameters:
| Parameter | Description | Required | Possible values |
| --------- | --------- | ----------- | --------------- |
| `--input` | The URL or local file path of an OSLO stakeholders csv file | :heavy_check_mark: ||
| `--output` | Name of the output file | No, default `stakeholders.jsonld` ||
