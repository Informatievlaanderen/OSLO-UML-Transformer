# OSLO Core

> Package that contains the core interfaces, classes, functions that can be used across the various components.

## Install

```
> npm install @oslo-flanders/core
```

## Usage

Everything can be imported through named imports from the core package.

```
import { XXX } from '@oslo-flanders/core'
```

## Package content

The core package contains has the following content:

### Interfaces

#### `Converter`

Interface that must be implemented when creating a new converter.

#### `Generator`

Interface that must be implemented when creating a new generator.

#### `OutputHandler`

Interface that must be implemented when creating a new output handler.

### Logging

A Logger class that internally uses the winston logger. A logger can be created with the `getLoggerFor` function which takes a class or string as parameter
```
import { getLoggerFor } from '@oslo-flanders/core'

export class ExampleClass {
  // Log messages will contain '[ExampleClass]'
  private readonly logger = getLoggerFor(this);

  ...
}

export function exampleFunction(): void {
  // Log messages will contain '[ExampleFunction]'
  const logger = getLoggerFor('ExampleFunction');

  ...
}

```

### Utils

Small and easy function used in various other packages.

#### `fetchFileOrUrl`

Fetches a file or URL and returns a `Buffer`.
```
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

Function that returns random string, which a very low probability that the same string is going to be returned multiple times.

```
import { uniqueId } from '@oslo-flanders/core'

const id = uniqueId();
```

### OSLO types

Interfaces that represent the different objects on the UML class diagram of the intermediary format.

TODO → work in progress, as we are discussing if this is an added value.


