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

| Parameter     | Description                                                                             | Required           | Possible values  |
| ------------- | --------------------------------------------------------------------------------------- | ------------------ | ---------------- |
| `--input`     | The URL or local file path of an OSLO JSON-LD file                                      | :heavy_check_mark: |                  |
| `--whitelist` | The URL or local file path to a whitelist json containing a set of allowed URI prefixes | :heavy_check_mark: | `whitelist.json` |

## Usage

```bash
oslo-jsonld-validator --input report.jsonld --whitelist whitelist.json
oslo-jsonld-validator --input report.jsonld --whitelist https://raw.githubusercontent.com/Informatievlaanderen/OSLO-UML-Transformer/refs/heads/configuration/whitelist.json
```
