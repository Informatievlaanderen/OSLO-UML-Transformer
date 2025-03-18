# OSLO-UML-Transformer Supported Tags

This document describes all supported tags in the OSLO-UML-Transformer. These tags can be applied to elements in Enterprise Architect to control how they are transformed into semantic web artifacts.

## Language Variations

Most descriptive tags (labels, definitions, usage notes) support language variations by appending a language code suffix:

- `-nl` - Dutch
- `-en` - English
- `-fr` - French
- `-de` - German
- `-es` - Spanish

Example: `ap-definition-nl`, `label-en`.

The list of supported languages can be found in the `Language` enum [here](/packages/oslo-core/lib//enums//Language.ts).

## Basic Metadata Tags

| Tag Name     | Enum Value   | Description                                         | Example                                           |
| ------------ | ------------ | --------------------------------------------------- | ------------------------------------------------- |
| Definition   | `definition` | The formal definition of an element.                | `definition-nl=Een natuurlijk persoon.`           |
| Label        | `label`      | The human-readable label for an element.            | `label-en=Person`                                 |
| Usage Note   | `usageNote`  | Additional notes about how to use an element.       | `usageNote-nl=Gebruik voor natuurlijke personen.` |
| Status       | `status`     | The status of an element (e.g. stable, deprecated). | `status=stable`                                   |
| Local Name   | `name`       | Specifies a custom local name for an element.       | `name=Person`                                     |
| External URI | `uri`        | Specifies an external URI for the element.          | `uri=http://xmlns.com/foaf/0.1/Person`            |
| Parent URI   | `parentURI`  | Specifies the parent class or property URI.         | `parentURI=http://purl.org/dc/terms/title`        |

## Application Profile Tags

| Tag Name      | Enum Value      | Description                                                   | Example                                                                   |
| ------------- | --------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| AP Label      | `ap-label`      | The label for an element in an Application Profile.           | `ap-label-nl=Persoon`                                                     |
| AP Definition | `ap-definition` | The definition for an element in an Application Profile.      | `ap-definition-en=A natural person.`                                      |
| AP Usage Note | `ap-usageNote`  | Usage notes for an element in an Application Profile.         | `ap-usageNote-nl=Te gebruiken voor burgers.`                              |
| AP Codelist   | `ap-codelist`   | Specifies a codelist URI for an Application Profile property. | `ap-codelist=https://data.vlaanderen.be/id/conceptscheme/standaardstatus` |

## Vocabulary Tags

| Tag Name   | Enum Value   | Description                                                   | Example                                   |
| ---------- | ------------ | ------------------------------------------------------------- | ----------------------------------------- |
| Label      | `label`      | The label for an element in a vocabulary.                     | `label-nl=Persoon`                        |
| Definition | `definition` | The definition for an element in a Vocabulary.                | `definition-en=A natural person.`         |
| Usage Note | `usageNote`  | Usage notes for an element in a Vocabulary.                   | `usageNote-nl=Te gebruiken voor burgers.` |
| Name       | `name`       | Specifies a custom local name for an element in a Vocabulary. | `name=Person`                             |

## Association Tags

_Added soon - reverse prefixes_

| Tag Name        | Enum Value        | Description                                       | Example                                  |
| --------------- | ----------------- | ------------------------------------------------- | ---------------------------------------- |
| Source Prefix   | `source-`         | Used for source-end properties of an association. | `source-ap-label=Owner of a property`    |
| Target Prefix   | `target-`         | Used for target-end properties of an association. | `target-ap-label=Owner of a property`    |
| Source URI      | `source-uri`      | URI for the source end property.                  | `source-uri=http://example.org/hasOwner` |
| Target Label    | `target-label`    | Label for the target end of an association.       | `target-label-en=owns`                   |
| Target AP Label | `target-ap-label` | AP label for the target end.                      | `target-ap-label-nl=bezit`               |
| Target URI      | `target-uri`      | URI for the target end property.                  | `target-uri=http://example.org/owns`     |

## Package Tags

| Tag Name             | Enum Value    | Description                                   | Example                                            |
| -------------------- | ------------- | --------------------------------------------- | -------------------------------------------------- |
| Defining Package     | `package`     | Specifies which package defines this element. | `package=OSLO-Persoon`                             |
| Package Base URI     | `baseURI`     | Base URI for the package.                     | `baseURI=https://data.vlaanderen.be/ns/person/`    |
| Package Ontology URI | `ontologyURI` | URI of the ontology for the package.          | `ontologyURI=https://data.vlaanderen.be/ns/person` |

## Special Behavior Tags

| Tag Name                   | Enum Value                 | Description                                         | Example                         |
| -------------------------- | -------------------------- | --------------------------------------------------- | ------------------------------- |
| Ignore                     | `ignore`                   | Instructs the transformer to ignore this element.   | `ignore=true`                   |
| Ignore Implicit Generation | `ignoreImplicitGeneration` | Prevents automatic generation of implicit elements. | `ignoreImplicitGeneration=true` |
| Is Literal                 | `literal`                  | Marks a class as a literal value (not an object).   | `literal=true`                  |
| Range                      | `range`                    | Specifies the range of a property explicitly.       | `range=xsd:string`              |
| Domain                     | `domain`                   | Specifies the domain of a property explicitly.      | `domain=Person`                 |
