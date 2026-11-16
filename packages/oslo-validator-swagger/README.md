# `OSLO Swagger Validator`

> Validates OpenAPI Swagger specifications against `openapi-generator-maven-plugin` by running actual code generation inside a Docker container.
> Optionally performs **round-trip validation** by deserializing example JSON files into the generated model classes, validating with JSR-303, re-serializing, and comparing the output to the input.

## Install

```bash
npm install @oslo-flanders/swagger-validator
```

## Global install

```bash
npm install -g @oslo-flanders/swagger-validator
```

## API

| Parameter      | Description                                                       | Required           | Default |
| -------------- | ----------------------------------------------------------------- | ------------------ | ------- |
| `--input`      | Path or URL to the OpenAPI Swagger file                           | :heavy_check_mark: |         |
| `--suite`      | Validation suite(s) to run (repeatable)                           |                    | `java`  |
| `--root-model` | Fully-qualified class name of the root model for round-trip JSON validation |           |         |
| `--examples`   | Example JSON files (local paths or URLs) for round-trip validation (repeatable) |          |         |
| `--logLevel`   | Log level                                                         |                    | `info`  |
| `--silent`     | Suppress all logging output                                       |                    | `false` |

## Usage

```bash
# Validate a local spec file
oslo-validator-swagger --input swagger.yaml

# Validate a spec from a URL
oslo-validator-swagger --input https://example.com/spec.json

# Run round-trip validation with example JSON files
oslo-validator-swagger \
  --input swagger.json \
  --root-model be.vlaanderen.validator.model.PersonEnvelope \
  --examples example1.json \
  --examples example2.json

# Run round-trip validation with example files from URLs
oslo-validator-swagger \
  --input https://example.com/spec.json \
  --root-model be.vlaanderen.validator.model.PersonEnvelope \
  --examples https://example.com/example1.json \
  --examples https://example.com/example2.json

# Run multiple suites (unsupported for now)
oslo-validator-swagger --input swagger.yaml --suite java --suite dotnet
```

## Round-trip validation

When `--root-model` and `--examples` are provided, the validator:

1. Generates Java model classes from the OpenAPI spec using `openapi-generator-maven-plugin`
2. Compiles the generated code together with the built-in `RoundTripValidator`
3. For each example JSON file:
   - **Deserializes** the JSON into the root model class
   - **Validates** the deserialized object with JSR-303 bean validation
   - **Re-serializes** the object back to JSON
   - **Compares** the output JSON to the input JSON, reporting any missing or changed fields

This catches issues like:
- Missing fields in the generated model (data loss during round-trip)
- JSR-303 constraint violations on example data
- Incompatible type mappings between OpenAPI types and Java types
