import { writeFile } from 'fs/promises';
import type { GeneratorConfiguration } from '@oslo-flanders/configuration';
import { Generator } from '@oslo-flanders/core';
import { extractDescription, extractLabel } from './utils/utils';

// TODO: check if all cases are being handled here

export class ShaclGenerator extends Generator<GeneratorConfiguration> {
  private readonly classIdPropertyWellKnownIdMap: Map<string, string[]>;

  public constructor() {
    super();
    this.classIdPropertyWellKnownIdMap = new Map<string, string[]>();
  }

  public async generate(data: string): Promise<void> {
    const document = JSON.parse(data);

    const [classShapes, propertyShapesMap] = await Promise.all([
      this.createClassShape(document.classes),
      this.createPropertyShape(document.attributes),
    ]);

    classShapes.forEach(classShape => {
      const propertyWellKnownIds = this.classIdPropertyWellKnownIdMap.get(classShape['sh:targetClass']);
      const classPropertyShapes = propertyWellKnownIds?.map(x => propertyShapesMap.get(x));
      classShape['sh:property'] = classPropertyShapes;
    });

    const shacl = {
      '@context': '',
      '@id': 'THIS ID MUST COME FROM CONFIGURATION',
      shapes: classShapes,
    };

    await writeFile(this.configuration.shaclOutput, JSON.stringify(shacl, null, 2));
  }

  private async createClassShape(classes: any[]): Promise<any[]> {
    return classes.map(_class => ({
      '@id': `${_class['@id']}Shape`,
      '@type': 'sh:NodeShape',
      'sh:targetClass': _class['@id'],
      'sh:closed': false,
      'sh:property': [],
    }));
  }

  private async createPropertyShape(properties: any[]): Promise<Map<string, any[]>> {
    const shapes = new Map<string, any[]>();

    properties.forEach(property => {
      const label = extractLabel(property, this.configuration.language);
      const description = extractDescription(property, this.configuration.language);
      const range = property.range;

      if (!label) {
        this.logger.error(`Unnable to find label in language ${this.configuration.language} for attribute ${property['@id']}, skipping it.`);
      }

      if (!description) {
        this.logger.error(`Unnable to find description in language ${this.configuration.language} for attribute ${property['@id']}, skipping it.`);
      }

      if (!range) {
        this.logger.error(`Unnable to find range for attribute ${property['@id']}, skipping it.`);
      }

      const propertyShape: any = {
        'sh:path': property['@id'],
        'sh:name': label,
        'sh:description': description,
        'sh:minCount': property.minCount,
        'sh:maxCount': property.maxCount,
      };

      const dataTypeOrNodeKindPredicate = property['@type'] === 'http://www.w3.org/2002/07/owl#DatatypeProperty' ?
        'sh:datatype' :
        'sh:class';

      propertyShape[dataTypeOrNodeKindPredicate] = range['@id'];

      shapes.set(property.guid, propertyShape);

      // Build map with classId (domainId in property) mapped to well-known id
      const domain = property.domain;

      if (!domain) {
        this.logger.error(`Unnable to find domain for attribute ${property['@id']}, and will not be added to the corresponding class`);
      } else {
        const domainId = domain['@id'];

        this.classIdPropertyWellKnownIdMap
          .set(domainId, [...this.classIdPropertyWellKnownIdMap.get(domainId) || [], property.guid]);
      }

      return shapes;
    });

    return shapes;
  }
}
