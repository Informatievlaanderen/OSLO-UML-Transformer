# OSLO Core

> Package that contains the core interfaces, classes and functions that can be used across other packages

## Install

```bash
npm install @oslo-flanders/Core
```

## Usage

Everything can be imported through named imports from the core packages.
```node
import { XXX } from '@oslo-flanders/core'
```

## Package content

The core package contains general interfaces and utility functions

### Interfaces

#### `IConversionService`
Interface that must be implemented when creating a new conversion service

#### `Generator`
Interface that must be implemented when creating a new generator.

#### `IOutputHandler`
Interface that must be implemented when creating a new output handler.

#### `IConfiguration`
Interface that must be implemented when creating a new configuration class.

#### `AppRunner`
**Abstract** class that contains the CLI service to start a conversion or generator service.

### Utils

Small and easy functions that can be used in other packages

#### `fetchFileOrUrl`

Fetches a file or URL and returns a `Buffer`.
```node
import { fetchFileOrUrl } from '@oslo-flanders/core'

const buffer = fetchFileOrUrl('/path/or/url/to/file');
```

#### `namespaces`

Function that ensures that we don't have to write full URIs anymore. Takes the local identifier as string parameter and returns an RDF.NamedNode:
```
import { ns } from '@oslo-flanders/core'

const exampleNamedNode = ns.example('test');

// exampleNamedNode.value is equal to 'http://example.org/test'

const rdfType = ns.rdf('type');

// rdfType.value will be 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
```

#### `uniqueId`

Function that returns random string, with a very low probability that the same string is going to be returned multiple times.

```
import { uniqueId } from '@oslo-flanders/core'

const id = uniqueId();
```
