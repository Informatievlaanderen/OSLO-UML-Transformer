# `OSLO Swagger Validator`

> Validates OpenAPI Swagger specifications against `openapi-generator-maven-plugin` by running actual code generation inside a Docker container.

## Install

```bash
npm install @oslo-flanders/swagger-validator
```

## Global install

```bash
npm install -g @oslo-flanders/swagger-validator
```

## API

| Parameter    | Description                             | Required           | Default |
| ------------ | --------------------------------------- | ------------------ | ------- |
| `--input`    | Path or URL to the OpenAPI Swagger file | :heavy_check_mark: |         |
| `--suite`    | Validation suite(s) to run (repeatable) |                    | `java`  |
| `--logLevel` | Log level                               |                    | `info`  |
| `--silent`   | Suppress all logging output             |                    | `false` |

## Usage

```bash
# Validate a local spec file
oslo-validator-swagger --input swagger.yaml

# Validate a spec from a URL
oslo-validator-swagger --input https://example.com/spec.json

# Run multiple suites (unsupported for now)
oslo-validator-swagger --input swagger.yaml --suite java --suite dotnet
```
