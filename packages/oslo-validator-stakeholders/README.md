# OSLO Stakeholders Validator

> Validates stakeholder files for usage of OVO codes.

## Install

```bash
npm install @oslo-flanders/stakeholders-validator

```

## Global install

```bash
npm install -g @oslo-flanders/stakeholders-validator

```

## API

| Parameter  | Description                                              | Required           | Possible values                       |
| ---------- | -------------------------------------------------------- | ------------------ | ------------------------------------- |
| `--input`  | The URL or local file path of an OSLO stakeholders file. | :heavy_check_mark: |                                       |
| `--format` | Input format of the stakeholders file.                   | :heavy_check_mark: | application/json, application/ld+json |

## Usage

```bash
oslo-stakeholders-validator --input stakeholders.json --format application/json
oslo-stakeholders-validator --input https://somewebsite.com/stakeholders.json --format application/ld+json
```
