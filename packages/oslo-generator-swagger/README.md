# `OSLO Swagger Generator`

> Given an OSLO-compliant RDF file, this tool generates a Swagger API from it.

## Install
```bash
npm install @oslo-flanders/swagger-generator
```

## Global install
To use the service from the command line anywhere, you can install it globally.
```bash
npm install -g @oslo-flanders/swagger-generator
```

## API

The service is executed from the CLI and expects the following parameters:
| Parameter          | Description                                                  | Required           | Possible values             |
| ------------------ | ------------------------------------------------------------ | ------------------ | --------------------------- |
| `--input`          | The URL or local file path of an OSLO-compliant RDF file     | :heavy_check_mark: |                             |
| `--output`         | The name of the output file                                  | :heavy_check_mark: |                             |
| `--language`       | The language in which the Swagger must be generated (labels) | No                 |                             |
| `--versionSwagger` | Swagger OpenAPI specification version                        | :heavy_check_mark: |                             |
| `--versionAPI`     | API version                                                  | :heavy_check_mark: |                             |
| `--title`          | Title of the API document                                    | :heavy_check_mark: |                             |
| `--description`    | Description of the API document                              | :heavy_check_mark: |                             |
| `--contextURL`     | JSON-LD context URL of the datastandard used in the API      | :heavy_check_mark: |                             |
| `--baseURL`        | API base URL for endpoints and PURIs                         | :heavy_check_mark: |                             |
| `--contactName`    | Name of the person or organisation to contact about the API  | No                 |                             |
| `--contactEmail`   | E-mail to contact for questions about the API                | No                 |                             |
| `--contactURL`     | Link to follow as contact about the API                      | No                 |                             |
| `--licenseName`    | Name of the license of the API                               | No                 |                             |
| `--licenseURL`     | URL of the license of the API                                | No                 |                             |
| `--silent`         | Suppress log messages                                        | No                 | `true` or `false` (default) |

## Usage
```bash
oslo-generator-swagger --input report.jsonld --output swagger.json --language nl --versionSwagger 3.0.4 --versionAPI 1.0.0 --title "Mijn API" --description "Mijn API beschrijving." --contextURL http://example.com/context.jsonld --baseURL http://example.com
```
