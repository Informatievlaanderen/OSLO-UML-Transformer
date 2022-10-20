/**
 * Contains the table names that are used to extract data from the
 * Enterprise Architect file.
 */
export enum EaTable {
  Diagram = 't_diagram',
  DiagramObject = 't_diagramobjects',
  DiagramLink = 't_diagramlinks',
  Connector = 't_connector',
  ConnectorTag = 't_connectortag',
  ConnectorRoleTag = 't_taggedvalue',
  ClassAndPackage = 't_object',
  ClassAndPackageTag = 't_objectproperties',
  Package = 't_package',
  Object = 't_object',
  Attribute = 't_attribute',
  AttributeTag = 't_attributetag'
}