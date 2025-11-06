# `OSLO Codelist Generator`

> Generates SKOS codelists from CSV files

## Install

```bash
npm install @oslo-flanders/codelist-generator
```

## Global install

```bash
npm install -g @oslo-flanders/codelist-generator
```

## API

The service is executed from the CLI and expects the following parameters:

| Parameter            | Description                                                                | Required           | Possible values                   |
| -------------------- | -------------------------------------------------------------------------- | ------------------ | --------------------------------- |
| `--input`            | The local path or url of the CSV file                                      | :heavy_check_mark: |                                   |
| `--output`           | The path where the generated Turtle file will be written to                | :heavy_check_mark: |                                   |
| `--language`         | The language in which the labels and definitions are written               | :heavy_check_mark: | Language codes (e.g., `en`, `nl`) |
| `--labelColumn`      | The name of the CSV column containing the preferred labels for concepts    | :heavy_check_mark: | Column name from CSV header       |
| `--definitionColumn` | The name of the CSV column containing definitions for concepts             | No                 | Column name from CSV header       |
| `--notationColumn`   | The name of the CSV column containing notation codes for concepts          | No                 | Column name from CSV header       |
| `--narrowerColumn`   | The name of the CSV column containing narrower references (pipe-separated) | No                 | Column name from CSV header       |
| `--broaderColumn`    | The name of the CSV column containing broader references (pipe-separated)  | No                 | Column name from CSV header       |
| `--statusColumn`     | The name of the CSV column containing status URIs for concepts             | No                 | Column name from CSV header       |
| `--datasetColumn`    | The name of the CSV column containing dataset/catalog URIs                 | No                 | Column name from CSV header       |

## Usage

```bash
oslo-codelist-generator --input codelist.csv --language nl
oslo-codelist-generator --input codelist.csv --output codelist.ttl --language nl --labelColumn prefLabel --definitionColumn definition --notationColumn notation --narrowerColumn narrower --broaderColumn broader --statusColumn status --datasetColumn dataset
```

## CSV Format

The CSV file should have the following structure:

### Required Columns

- `_id` - The URI of the concept
- `@type` - The RDF type (e.g., `http://www.w3.org/2004/02/skos/core#Concept` or `http://www.w3.org/2004/02/skos/core#ConceptScheme`)

### Optional Columns

These are mapped via the configuration parameters:

- **Label Column** (via `--labelColumn`) - The preferred label for the concept
- **Definition Column** (via `--definitionColumn`) - The definition or description of the concept
- **Notation Column** (via `--notationColumn`) - Notation of the concept
- **Narrower Column** (via `--narrowerColumn`) - URIs of narrower concepts (pipe-separated `|`)
- **Broader Column** (via `--broaderColumn`) - URIs of broader concepts (pipe-separated `|`)
- **Status Column** (via `--statusColumn`) - Status URI for the concept
- **Dataset Column** (via `--datasetColumn`) - URI of the dataset or catalog the concept belongs to

### Special Columns

- `inScheme` - The concept scheme URI this concept belongs to
- `topConceptOf` - The concept scheme URI where this is a top-level concept
- `hasTopConcept` - For ConceptScheme rows, pipe-separated URIs of top concepts (pipe-separated `|`)

### Example CSV

```csv
_id,@type,prefLabel,definition,inScheme,topConceptOf,notation,broader
https://data.vlaanderen.be/id/concept/Status/Active,http://www.w3.org/2004/02/skos/core#Concept,Actief,Status dat aangeeft dat de resource actief is.,https://data.vlaanderen.be/id/conceptscheme/Status,https://data.vlaanderen.be/id/conceptscheme/Status,ACTIVE,
https://data.vlaanderen.be/id/concept/Status/Inactive,http://www.w3.org/2004/02/skos/core#Concept,Inactief,Status dat aangeeft dat de resource inactief is.,https://data.vlaanderen.be/id/conceptscheme/Status,https://data.vlaanderen.be/id/conceptscheme/Status,INACTIVE,
https://data.vlaanderen.be/id/conceptscheme/Status,http://www.w3.org/2004/02/skos/core#ConceptScheme,Status Conceptscheme,Een conceptschema voor verschillende statussen.,,,,
```
