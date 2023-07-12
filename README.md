# OSLO UML Transformer
![Unit tests](https://github.com/informatievlaanderen/OSLO-UML-Transformer/actions/workflows/ci-unit-tests.yml/badge.svg)

This repository contains open-source software that can be used to transform data models, modelled as UML diagrams in Enterprise Architect, into various artefacts such as an HTML page, JSON-LD context file or an RDF file. These components were built to support the Flemish Interoperability Program, called Open Standards for Linked Organizations (OSLO), which is reponsible for the creation of data standards in Flanders, based on the principles of Linked Data.

## Setup of the repo

This repository is managed as a monorepo, using Lerna. Each package in this repository acts as a stand-alone component that can be executed via the CLI and has its own version management. The following components are available:
- `oslo-converter-stakeholders` transforms an OSLO stakeholders csv file into JSON-LD
- `oslo-converter-uml-ea` converts an Enterprise Architect file into JSON-LD, called OSLO JSON-LD, which is used as input for the generators
- `oslo-core` contains the core interfaces, utility functions, loggers, etc... that can be used in the other packages
- `oslo-extractor-uml-ea` reads the Enterprise Architect file and maps the data to types
- `oslo-generator-jsonld-context` generates a JSON-LD context file using an OSLO JSON-LD as input
- `oslo-generator-rdf-vocabulary` generates an RDF file using an OSLO JSON-LD as input
- `oslo-generator-respec-html` generates an HTML page using the ReSpec template using an OSLO JSON-LD as input

The packages `oslo-core` and `oslo-extractor-uml-ea` are not executable via the CLI, as their purpose is to be added as a depedency in other packages.

## How to run

Each package package is published on the NPM registry and can be installed globally or as part of a NodeJS project. The README.md of each package describes how the component can be executed along with the various CLI options.

## Developer information

### How To Build

To build the source code, the dependencies must first be installed:
```bash
npm install
```
Then, link the local packages together and install remaining package dependencies:
```bash
npm run bootstrap
```
Finally, the source code can be built:
```bash
npm run build
```

### How To Test

Each package has a number of unit tests that can be executed with the following command:
```bash
npm run test:unit
```
Running this command in the root folder will execute the unit test command for each package, while running it in a package folder will only trigger the unit tests of the particular package.

#### CI/CD (GitHub Actions)

On every push or pull request on the main branch, the unit tests are run automatically via Github Actions. Next to the unit tests, we are working on integration tests, that will also be run on every push or pull request.

**Note**: Due to the different (large) input files, the integration tests will not be part of the package and will only be performed via GitHub Actions.

## Copyright

This code is copyrighted by [Digitaal Vlaanderen](https://www.vlaanderen.be/digitaal-vlaanderen) and released under the [MIT license](./LICENSE)
