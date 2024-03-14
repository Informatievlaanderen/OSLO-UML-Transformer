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
| `--constraints` | Additional constraints to add to the SHACL shapes | No | `stringsNotEmpty`, `uniqueLanguages` or `nodeKind`. Multiple constraint are allowed |
| `--applicationProfileURL` | The URL on which the application profile is published, to create cross-references | No | |
| `--useUniqueURIs` | Create unique HTTP URIs for the individual SHACL shapes using the labels | No, default `false` | |
| `--addCodelistRules` | Add rules for codelists, if present | No, default `false` | |
| `--addConstraintMessages` | Add additional messages in the configured language to the SHACL shapes | No, default `false` ||
| `--addConstraintRuleNumbers` | Add extra entry for rule numbers, allowing editors to add a rule numbers across multiple specs | No, default `false` ||

