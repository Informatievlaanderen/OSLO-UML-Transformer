# OSLO Runner

> Creates an app that executes a converter or one or more generators

## Install
```
> npm install '@oslo-flanders/runner'
```

## Usage

The runner is executed from the command line and expects the following input parameters:
| Parameter | Shorthand | Description | Possible values |
| --------- | --------- | ----------- | --------------- |
| `--appType` | `-t` | The app that should be created by the app runner | `converter` / `generator` |
| `--config` | `-c` | Configuration file that is passed to the app | *path to the config file* (a **JSON** file) |

### Configuration

Depending on the converter or generator(s) that will run, the configuration file will be different. **Additionally, a specific converter or generator(s) can be configured in the configuration file. Make sure the converter or generators are added to the package.json of the runner package.** 

- To set a converter, add `converterPackageName` to the configuration file and add the package name of the converter as value. The default converter is the [OSLO Enterprise Architect Converter](../oslo-converter-uml-ea//README.md).
```javascript
{
  "converterPackageName" : "@oslo-flanders/ea-converter"

  // Other configuration properties omitted
  ...
}
```
- To set one or more generators, add `generatorPackageName` to the configuration file and add the package names of the generators as value. Default all the OSLO Generators will be set.
```javascript
{
  "converterPackageName" : [ TODO1, TODO2 ]

  // Other configuration properties omitted
  ...
}
```

## Example

To create an app that uses the OSLO Enterprise Architect Converter, pass `converter` as the value of `--appType` on the command line. The configuration file should look like this:
```javascript
{
  "converterPackageName": "@oslo-flanders/ea-converter",  // Package name of the converter
  "umlFile": "XXX", // Path or URL of the Enteprise Architect file containing the UML diagram
  "diagramName": "XXX", // Name of the UML diagram within the EA file
  "outputFile": "XXX", // Path of the output file
  "specificationType": "XXX", // Specification type, possible values are 'ApplicationProfile' or 'Vocabulary'
  "publicationEnvironmentDomain": "XXX", // Domain of the publication environment
  "documentId": "XXX" // Id (URI) that is used to identify the document in the output file (root @id in JSON-LD)
}
```




