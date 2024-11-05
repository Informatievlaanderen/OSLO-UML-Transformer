# Webuniversum Types

## WebuniversumObject

### id

The unique identifier of the object. This should be a unique URI. The URI should be a valid URL. The URI itself can both be an external URI hosted by a third-party or one maintained by us in one of our own namespaces.

#### Examples

```json
"id": "https://data.vlaanderen.be/ns/RuimtelijkPlannen#RuimtelijkObjectRelatie",
"id": "https://data.vlaanderen.be/ns/RuimtelijkPlannen#relatieType",
"id": "https://schema.org/identifier",
```

### vocabularyLabel

A human-readable label for the object. This label should be unique within the vocabulary. The label should be in the language of the vocabulary.

#### Examples

```json
"vocabularyLabel": {
    "nl": "identificator"
},
"vocabularyLabel": {
    "nl": "geldigheid"
},
```

### applicationProfileLabel

A human-readable label for the object. This label should be unique within the application profile. The label should be in the language of the application profile.

#### Examples

```json
"applicationProfileLabel": {
    "nl": "identificator"
},
"applicationProfileLabel": {
    "nl": "geldigheid"
},
```

### vocabularyDefinition

A human-readable definition for the object. This definition explains the meaning of the object within the vocabulary. The definition should be in the language of the vocabulary.

#### Examples

```json
"vocabularyDefinition": {
    "nl": "Unieke identificator van een ruimtelijk object."
},
"vocabularyDefinition": {
    "nl": "De periode waarin een ruimtelijk object geldig is."
},
```

### applicationProfileDefinition

A human-readable definition for the object. This definition explains the meaning of the object within the application profile. The definition should be in the language of the application profile.

#### Examples

```json
"applicationProfileDefinition": {
    "nl": "Unieke identificator van een ruimtelijk object."
},
"applicationProfileDefinition": {
    "nl": "De periode waarin een ruimtelijk object geldig is."
},
```

### vocabularyUsageNote

A human-readable usage note for the object. This usage note describes how the object should be used. This can be a bit more verbose. The usage note should be in the language of the vocabulary.

#### Examples

```json
"vocabularyUsageNote": {
    "nl": "De codelijst van RuimtelijkObjectTypes werd gestructureerd volgens verschillende soorten gebiedsindelingen. Zo schuilen achter het RuimtelijkObjectType \"administratieveGebiedsindeling\" bijvoorbeeld nog een aantal specifiekere RuimtelijkObjectTypes, waaronder \"gemeente\", \"arrondissement\" en \"provincie\". Zo kan in elk geval het meest specifieke RuimtelijkObjectType dat van toepassing is, geselecteerd worden uit de hiërarchische codelijst."
}
"vocabularyUsageNote": {
    "nl": "Voorbeelden van een gebied: een jurisdictie of adminstratieve eenheid of een plaatsnaam of coördinaten. Voorbeelden van een periode: een benoemd tijdperk of datum of datumbereik. OPMERKING: Te substitueren door de klasse of het datatype dat van toepassing, bv Locatie in het geval van een gebied en Periode voor een tijdsaanduiding."
}
```

### applicationProfileUsageNote

A human-readable usage note for the object. This usage note describes how the object should be used. This can be a bit more verbose. The usage note should be in the language of the application profile.

#### Examples

```json
"applicationProfileUsageNote": {
    "nl": "Voorbeelden van een gebied: een jurisdictie of adminstratieve eenheid of een plaatsnaam of coördinaten. Voorbeelden van een periode: een benoemd tijdperk of datum of datumbereik. OPMERKING: Te substitueren door de klasse of het datatype dat van toepassing, bv Locatie in het geval van een gebied en Periode voor een tijdsaanduiding."
}
"applicationProfileUsageNote": {
    "nl": "Referentie naar het ruimtelijk object (plaats of adres) dat gebruikt wordt als indirecte locatie aanduiding."
}
```

### parents

A list of parent objects. These parents indicate the hierarchical relationship between objects. The parent objects should be objects themselves and should contain at least the id, vocabularyLabel and applicationProfileLabel properties.

#### Examples

```json
"parents": [
    {
        "id": "https://data.vlaanderen.be/ns/RuimtelijkPlannen#RuimtelijkObject",
        "vocabularyLabel": {
            "nl": "Ruimtelijk object"
        },
        "applicationProfileLabel": {
            "nl": "Ruimtelijk object"
        }
    }
]
"parents": [
    {
        "id": "http://def.isotc211.org/iso19109/2005/GeneralFeatureModel#GF_PropertyType",
        "vocabularyLabel": {
            "nl": "Kenmerktype"
        },
        "applicationProfileLabel": {
            "nl": "Kenmerktype"
        }
    }
],
```

### status

The status of the object. Please refer to the [enum](https://github.com/Informatievlaanderen/OSLO-UML-Transformer/blob/main/packages/oslo-converter-uml-ea/lib/enums/Status.ts) for the possible values. The status can deviate from the status of the whole vocabulary or application profile.

#### Examples

```json
"status": "https://data.vlaanderen.be/id/concept/StandaardStatus/KandidaatStandaard",
"status": "https://data.vlaanderen.be/id/concept/StandaardStatus/ErkendeStandaard",
```

### scope

The scope of the object. Please refer to the [enum](https://github.com/Informatievlaanderen/OSLO-UML-Transformer/blob/main/packages/oslo-core/lib/enums/Scope.ts) for the possible values. The scope will have an impact on the usage of the object. For example, External objects are treated differently from Internal objects.

#### Examples

```json
"scope": "https://data.vlaanderen.be/id/concept/scope/InPackage",
"scope": "https://data.vlaanderen.be/id/concept/scope/External",
```

### properties

A list of properties that are part of the object. These properties should be objects themselves typed accordingly to the WebunversumProperty.

## WebuniversumProperty

### domain

The domain of the property. This should be a valid URI. The URI should be a valid URL. The URI itself can both be an external URI hosted by a third-party or one maintained by us in one of our own namespaces.

#### Examples

```json
"domain": "http://www.w3.org/ns/locn#Geometry",
"domain": "https://data.vlaanderen.be/ns/RuimtelijkPlannen#IndirecteLocatieAanduiding",
```

### minCount

The minimum number of times the property should be present in the object. This should be a string representation of a number or a \*.

#### Examples

```json
"minCount": "0",
"minCount": "1",
"minCount": "*",
```

### maxCount

The maximum number of times the property should be present in the object. This should be a string representation of a number or a \*.

#### Examples

```json
"maxCount": "1",
"maxCount": "*",
```

### codelist

The codelist of the property. This should be a valid URI. The URI should be a valid URL. The URI itself can both be an external URI hosted by a third-party or one maintained by us in one of our own namespaces.

#### Examples

```json
"codelist": "https://data.vlaanderen.be/id/conceptscheme/Schaalniveaus",
```
