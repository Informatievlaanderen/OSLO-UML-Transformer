# `OSLO Examples Generator`

> Generates examples based on an OSLO JSON-LD file

## Install

```bash
npm install @oslo-flanders/examples-generator

```

## Global install

```bash
npm install -g @oslo-flanders/examples-generator

```

## API

| Parameter       | Description                                                                             | Required           | Possible values |
| --------------- | --------------------------------------------------------------------------------------- | ------------------ | --------------- |
| `--input`       | The path of an OSLO JSON-LD file                                                        | :heavy_check_mark: |                 |
| `--output`      | The directory where the generated examples will be generated                            | :heavy_check_mark: |                 |
| `--language`    | The language in which the examples should be generated                                  | :heavy_check_mark: |                 |
| `--contextbase` | the public base url on which the context of the jsons are published. Without trailing / | :heavy_check_mark: |                 |

## Usage

```bash
oslo-examples-generator  --input report.jsonld --language nl --contextbase /doc/ap/DigitaleWatermeter-ap/machinelearningInput --output ./examples
```
