# `OSLO SHACL Template Generator`

> Generates a SHACL template based on an OSLO JSON-LD file

## Install

```bash
npm install @oslo-flanders/shacl-template-generator
```

## Global install

```bash
npm install -g @oslo-flanders/shacl-template-generator
```

## API
| Parameter        | Description                                                 | Required                          | Possible values                             |
| ---------------- | ----------------------------------------------------------- | --------------------------------- | ------------------------------------------- |
| `--input`        | The path of an OSLO JSON-LD file | :heavy_check_mark:                |                                             |
| `--output`       | Name of the output file                                     | No, default `shacl.jsonld` |                                             |
| `--language`     | The language in which to generate the SHACL template | :heavy_check_mark: | |
| `--shapeBaseURI` | The base URI to be used for the HTTP URIs of the SHACL shapes | No, default `http://example.org` ||
| `--mode` | The generation mode | No, default `grouped` | `grouped` or `individual` |
| `--constraint` | Additional constraints to add to the SHACL shapes | No | `uniqueLanguages` or `nodeKind`. Multiple constraint are allowed |
| `--applicationProfileURL` | The URL on which the application profile is published, to create cross-references | No | |
| `--useUniqueURIs` | Create unique HTTP URIs for the individual SHACL shapes using the labels | No, default `false` | |
| `--addCodelistRules` | Add rules for codelists, if present | No, default `false` | |
| `--addConstraintMessages` | Add additional messages in the configured language to the SHACL shapes | No, default `false` ||
| `--addConstraintRuleNumbers` | Add extra entry for rule numbers, allowing editors to add a rule numbers across multiple specs | No, default `false` ||

## Usage

```bash
oslo-shacl-template-generator --input report.jsonld --language nl
oslo-shacl-template-generator --input report.jsonld --language nl --shapeBaseURI https://data.vlaanderen.be
oslo-shacl-template-generator --input report.jsonld --language nl --shapeBaseURI https://data.vlaanderen.be --mode individual
oslo-shacl-template-generator --input report.jsonld --language nl --shapeBaseURI https://data.vlaanderen.be --constraint uniqueLanguages --constraint nodeKind
oslo-shacl-template-generator --input report.jsonld --language nl --shapeBaseURI https://data.vlaanderen.be --applicationProfileURL https://data.vlaanderen.be/doc/applicatieprofiel/verkeersmetingen
oslo-shacl-template-generator --input report.jsonld --language nl --shapeBaseURI https://data.vlaanderen.be --useUniqueURIs true
oslo-shacl-template-generator --input report.jsonld --language nl --shapeBaseURI https://data.vlaanderen.be --addCodelistRules true
oslo-shacl-template-generator --input report.jsonld --language nl --shapeBaseURI https://data.vlaanderen.be --addConstraintMessages true
oslo-shacl-template-generator --input report.jsonld --language nl --shapeBaseURI https://data.vlaanderen.be --addConstraintRuleNumbers true
```

