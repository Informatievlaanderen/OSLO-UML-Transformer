# OSLO Enterprise Architect UML Extractor

> Reads all the information from an Enterprise Architect UML diagram

This package extracts all the information from the UML diagram and creates a data registry containing the packages, elements (classes, data types and enumerations), connectors and attributes. The extractor is used by the [OSLO conversion service](../oslo-converter-uml-ea/README.md).

## Install

```bash
npm install @oslo-flanders/ea-uml-extractor
```

## Usage
```node
import { DataRegistry } from "@oslo-flanders/ea-uml-extractor";

const model = new DataRegistry();
await model.extract("path/to/uml/diagram");
```
