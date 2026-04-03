# `OSLO SPARQL Generator`

> Given an OSLO-compliant RDF file, this tool generates a markdown file that describes classes and relevant properties, to be used in the Metadata Vlaanderen documentation.

## Install
```bash
npm install @oslo-flanders/markdown-generator
```

## Global install
To use the service from the command line anywhere, you can install it globally.
```bash
npm install -g @oslo-flanders/markdown-generator
```

## API

The service is executed from the CLI and expects the following parameters:
| Parameter          | Description                                                  | Required           | Possible values             |
| ------------------ | ------------------------------------------------------------ | ------------------ | --------------------------- |
| `--input`          | The URL or local file path of an OSLO-compliant RDF file     | :heavy_check_mark: |                             |
| `--output`         | The name of the output directory to store query files in     | No                 |                             |
| `--language`       | The language in which the SPARQL must be generated (labels)  | No                 |                             |
| `--silent`         | Suppress log messages                                        | No                 | `true` or `false` (default) |

## Usage

Using the published package.
```bash
oslo-generator-markdown --input dcatapvl.20220421.jsonld --output output --language nl
```

Using a development environment.
```bash
npm run build
./bin/runner.js --input dcatapvl.20220421.jsonld
```

For input, use the intermediary OSLO format. Some examples:
- [DCAT-AP-VL 2022-04-21](https://raw.githubusercontent.com/Informatievlaanderen/data.vlaanderen.be2-generated/refs/heads/production/report/doc/applicatieprofiel/DCAT-AP-VL/erkendestandaard/2022-04-21/all-DCAT-AP-VL-20.jsonld)
- [Metadata-DCAT 2022-04-21](https://github.com/Informatievlaanderen/data.vlaanderen.be2-generated/blob/production/report/doc/applicatieprofiel/metadata-dcat/erkendestandaard/2022-04-21/all-metadata-voor-services-ap.jsonld)
- [DCAT-AP-VL 2026-02-24](https://github.com/Informatievlaanderen/data.vlaanderen.be2-generated/blob/production/report4/doc/applicatieprofiel/DCAT-AP-VL/erkendestandaard/2026-02-24/merged/merged_metadata-voor-services-ap_nl.jsonld)