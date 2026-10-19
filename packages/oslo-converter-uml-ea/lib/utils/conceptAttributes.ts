import type { DataRegistry } from '@oslo-flanders/ea-uml-extractor';
import { EaAttribute, ElementType } from '@oslo-flanders/ea-uml-extractor';
import { TagNames } from '../enums/TagNames';

/**
 * An attribute added by the converter instead of being modelled in Enterprise Architect
 */
export class ConceptAttribute extends EaAttribute {}

interface ConceptAttributeDefinition {
  name: string;
  type: string;
  uri: string;
  definition: string;
}

// The attributes of W3C-SKOS::Concept as modelled in OSLO
const conceptAttributeDefinitions: ConceptAttributeDefinition[] = [
  {
    name: 'code',
    type: 'String',
    uri: 'http://www.w3.org/2004/02/skos/core#notation',
    definition: 'Code waarmee het concept binnen de codelijst wordt aangeduid.',
  },
  {
    name: 'voorkeursnaam',
    type: 'LangString',
    uri: 'http://www.w3.org/2004/02/skos/core#prefLabel',
    definition: 'Naam waarmee het concept bij voorkeur wordt aangeduid.',
  },
];

/**
 * Adds the SKOS Concept attributes to every enumeration, as if they were modelled in Enterprise Architect
 */
export function addConceptAttributesToEnumerations(model: DataRegistry): void {
  const enumerations = model.elements.filter(
    (x) => x.type === ElementType.Enumeration,
  );

  enumerations.forEach((enumeration) => {
    conceptAttributeDefinitions.forEach((definition, index) => {
      const attribute = new ConceptAttribute(
        // Negative, so it can never clash with the (positive) ids from Enterprise Architect
        -(enumeration.id * conceptAttributeDefinitions.length + index + 1),
        definition.name,
        `${enumeration.eaGuid}-${definition.name}`,
        enumeration.id,
        definition.type,
        '0',
        '1',
        '',
      );
      attribute.path = `${enumeration.path}:${definition.name}`;
      attribute.tags = [
        { tagName: TagNames.ExternalUri, tagValue: definition.uri },
        { tagName: `${TagNames.ApLabel}-nl`, tagValue: definition.name },
        {
          tagName: `${TagNames.ApDefinition}-nl`,
          tagValue: definition.definition,
        },
      ];
      model.attributes.push(attribute);
    });
  });
}
