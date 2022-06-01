# OSLO Configuration

> Contains various interfaces and classes that represent configurations that can be used to run different parts of the toolchain.

When developing new packages in the [OSLO-UML-Transformer monorepository](https://github.com/Informatievlaanderen/OSLO-UML-Transformer), any new configuration must be defined in this package.

## Install
```
> npm install @oslo-flanders/configuration
```

## Usage

At the moment, this package contains two interfaces that represent a configuration
- ConverterConfiguration → used to configure a Converter
- GeneratorConfiguration → used to configure one or more Generators

```
import type { ConverterConfiguration, GeneratorConfiguration } from '@oslo-flanders/configuration'
import { readFile } from 'fs/promises'

const raw = await readFile('/path/to/config/file');

const config: ConverterConfiguration = JSON.parse(raw);
```

### ConverterConfiguration

This interface has the following properties

#### `converterPackageName` (optional)

The package name of the converter that should be used. For example, when setting this property to `@oslo-flanders/ea-converter`, the [OSLO Enterprise Architect Converter](../oslo-converter-uml-ea/README.md) will be used.

- Default: `@oslo-flanders/ea-converter`

#### `diagramName`

The name of the diagram within the Enterprise Architect file.

#### `umlFile`

The URL or path of the file that contains the UML data model.

#### `specificationType`

Indicating which specificiation must be rendered. Two possible options:
- `ApplicationProfile`
- `Vocabulary`

#### `outputFile`

The path of the file where the results should be written to.

#### `publicationEnvironmentDomain`

The domain of the publication environment, which is used to determine the scope of all the objects on the diagram. 

For example, when publishing a data standard on [purl.eu](https://www.purl.eu) and terms defined within OSLO are re-used. These terms have a data.vlaanderen.be domain, which means the OSLO Enterprise Architect Converter would consider them as *external terms*, since the base URI of the data standard will have the domain *purl.eu*. By settings this property to `https://data.vlaanderen.be/`, the converter will scope them as *terms within the publication environment*.

#### `documentId`

The id of the output document.

For example, the OSLO Enteprise Architect Converter uses JSON-LD as output format, which means the root @id will be set with this value.

### GeneratorConfiguration

Coming soon → Some work is still being done on this interface

