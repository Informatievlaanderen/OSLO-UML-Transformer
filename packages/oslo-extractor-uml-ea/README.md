# OSLO Enterprise Architect UML Extractor

> Extracts the data from an Enterprise Achitect file

This package extracts all information from the UML data model, and should be used by a converter who handles the conversion of the raw data to the intermediate format.

The following objects are extracted from the UML data model:
- Packages
- Elements (classes, data types and enumerations)
- Connectors
- Attributes

## Install
```
> npm install @oslo-flanders/ea-uml-extractor
```

## Usage

```
import { UmlDataExtractor } from '@oslo-flanders/ea-uml-extractor'

const extractor = new UmlDataExtractor();

await extract.extractData('/path/or/url/to/ea/file');

// All objects are publicly available
const packages = extractor.packages;
const attributes = extractor.attributes;
const elements = extractor.elements
const connectors = extractor.connectors
```

## Types

This package contains types for the objects that are extracted from the UML data model: [`EaPackage`](./lib//types//EaPackage.ts), [`EaElement`](./lib/types/EaElement.ts), [`EaConnector`](./lib/types/EaConnector.ts), and [`EaAttribute`](./lib/types/EaAttribute.ts).
