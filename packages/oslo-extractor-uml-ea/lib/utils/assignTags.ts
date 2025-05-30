import { TagValues } from '../enums/TagValues';
import type { EaConnector } from '../types/EaConnector';
import type { EaObject } from '../types/EaObject';
import type { EaTag } from '../types/EaTag';

/**
 * Iterates over tags and adds it to the corresponding object.
 * @param tagValue - The value of the tag which we will replace the note errors from.
 */
// https://vlaamseoverheid.atlassian.net/browse/SDTT-360
// eslint-disable-next-line max-len
// https://github.com/Informatievlaanderen/OSLO-EA-to-RDF/blob/multilingual/src/main/java/com/github/informatievlaanderen/oslo_ea_to_rdf/convert/TagHelper.java#L314
function replaceNoteErrors(tagValue: string): string {
  return tagValue?.replace('NOTE$ea_notes=', '');
}

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
  tags.forEach((tag) => {
    const element = elements.find((x) => x.id === tag[objectIdPropertyName]);

    if (!element) {
      // TODO: log message
    } else {
      const eaTag: EaTag = {
        id: <number>tag.PropertyID,
        tagName: <string>tag.Property,
        // https://vlaamseoverheid.atlassian.net/jira/software/projects/SDTT/issues/SDTT-335
        // If there are NOTES, then the tag value is a note, otherwise it is the tag value.
        tagValue:
          <string>tag[tagValueName] === TagValues.NOTE
            ? replaceNoteErrors(tag.Notes)
            : <string>tag[tagValueName],
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
  eaConnectors.forEach((con) => {
    const connectorRoleTags = tags.filter((x) => x.ElementID === con.eaGuid);

    if (connectorRoleTags.length === 0) {
      return;
    }

    connectorRoleTags.forEach((roleTag) => {
      const eaRoleTag: EaTag = {
        id: <string>roleTag.PropertyID,
        tagName: <string>roleTag.TagValue,
        tagValue: replaceNoteErrors(roleTag.Notes),
      };

      if (roleTag.BaseClass === 'ASSOCIATION_SOURCE') {
        con.sourceRoleTags = con.sourceRoleTags
          ? [...con.sourceRoleTags, eaRoleTag]
          : [eaRoleTag];
      }

      if (roleTag.BaseClass === 'ASSOCIATION_TARGET') {
        con.destinationRoleTags = con.destinationRoleTags
          ? [...con.destinationRoleTags, eaRoleTag]
          : [eaRoleTag];
      }
    });
  });
}
