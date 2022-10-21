import { EaConnector } from "../types/EaConnector";
import { EaObject } from "../types/EaObject";
import { EaTag } from "../types/EaTag";

/**
 * Iterates over tags and adds it to the corresponding object.
 * @param tags - The tags to iterate. Could be element tags, package tags, attribute tags or connector tags.
 * @param elements - The elements to add the tags to. Could be EaElement, EaPackage, EaAttribute or EaConnector
 * @param objectIdPropertyName - The property name that contains the object id to whom the tag belongs.
 * @param tagValueName - The property name that contains the tag value
 */
export function addEaTagsToElements(
  tags: any[],
  elements: EaObject[],
  objectIdPropertyName: string,
  tagValueName: string,
): void {
  tags.forEach(tag => {
    const element = elements.find(x => x.id === tag[objectIdPropertyName]);

    if (!element) {
      //logger.warn(`Unable to find element with id ${tag[objectIdPropertyName]} to add following tag to: ${JSON.stringify(tag, null, 4)}`);
      return;
    } else {
      const eaTag: EaTag = {
        id: <number>tag.PropertyID,
        tagName: <string>tag.Property,
        tagValue: <string>tag[tagValueName],
      };

      element.tags = element.tags ? [...element.tags, eaTag] : [eaTag];
    }
  });
}

/**
 * Iterates all connectors and adds the corresponding role tags if added by the editor.
 * @param tags - The array of role tags.
 * @param eaConnectors - The array of connectors.
 */
export function addRoleTagsToElements(
  tags: any[],
  eaConnectors: EaConnector[],
): void {
  eaConnectors.forEach(con => {
    const connectorRoleTags = tags.filter(x => x.ElementID === con.eaGuid);

    if (connectorRoleTags.length === 0) {
      return;
    }

    connectorRoleTags.forEach(roleTag => {
      const eaRoleTag: EaTag = {
        id: <string>roleTag.PropertyID,
        tagName: <string>roleTag.TagValue,
        tagValue: <string>roleTag.Notes,
      };

      if (roleTag.BaseClass === 'ASSOCIATION_SOURCE') {
        con.sourceRoleTags = con.sourceRoleTags ? [...con.sourceRoleTags, eaRoleTag] : [eaRoleTag];
      }

      if (roleTag.BaseClass === 'ASSOCIATION_TARGET') {
        con.destinationRoleTags = con.destinationRoleTags ? [...con.destinationRoleTags, eaRoleTag] : [eaRoleTag];
      }
    });
  });
}