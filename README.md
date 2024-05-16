# OSLO UML model validator

This branch contains a script that will validate the EAP files of all the published standards for a certain branch. The script will generate an `error.log` file in the root of the repository with the errors that were found in the EAP files. The script stops as soon as it finds an error in an EAP file, so if multiple errors are present, only the first one will be logged.

## Setup of the repo

- `/constants` contains the constants that are used in the script. Here you can also change the environment for which you want to validate the EAP files.
- `/utils` helper functions that are used in the script.
- `index.ts` main script that runs.

## How to run

```bash
npm install
npm start
```

The start script will build the project and run the script using `Node.js`.

## Developer information

### How To Build

To build the source code, the dependencies must first be installed:

```bash
npm install
```

Finally, the source code can be built:

```bash
npm run build
```

## Copyright

This code is copyrighted by [Digitaal Vlaanderen](https://www.vlaanderen.be/digitaal-vlaanderen) and released under the [MIT license](./LICENSE)
