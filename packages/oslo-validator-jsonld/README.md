# OSLO JSON-LD Validator

> Validates JSON-LD files against a whitelist of allowed namespaces/URIs

This package validates that all URIs in a JSON-LD file match allowed namespace prefixes from a whitelist file. It helps ensure that only approved vocabularies and namespaces are used in your OSLO model.

## Install

```bash
npm install @oslo-flanders/jsonld-validator

```

## Global install

```bash
npm install -g @oslo-flanders/jsonld-validator

```

## API

| Parameter | Description                      | Required           | Possible values |
| --------- | -------------------------------- | ------------------ | --------------- |
| `--input` | The path of an OSLO JSON-LD file | :heavy_check_mark: |                 |

## Usage

```bash
oslo-jsonld-validator --input report.jsonld
```
