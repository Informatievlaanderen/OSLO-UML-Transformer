import alasql from 'alasql';
import type MDBReader from 'mdb-reader';
import { EaConnector } from './types/EaConnector';
import type { EaElement } from './types/EaElement';
import { EaTable } from './enums/EaTable';
import { convertToConnectorDirection } from './utils/connectorDirectionResolver';
import { addEaTagsToElements, addRoleTagsToElements } from './utils/tags';

export function loadElementConnectors(reader: MDBReader, elements: EaElement[]): EaConnector[] {
  const connectors = reader.getTable(EaTable.Connector).getData();
  const objects = reader.getTable(EaTable.Object).getData();

  const query = `
    SELECT connector.Connector_ID, 
      connector.Name, 
      connector.Direction, 
      connector.Notes, 
      connector.Connector_Type, 
      connector.SourceRole, 
      connector.DestRole, 
      connector.Start_Object_ID, 
      connector.End_Object_ID, 
      connector.PDATA1, 
      connector.ea_guid, 
      connector.SourceCard, 
      connector.DestCard
    FROM ? connector
      INNER JOIN ? source ON connector.Start_Object_ID = source.Object_ID
      INNER JOIN ? destination ON connector.End_Object_ID = destination.Object_ID
    WHERE source.Object_Type in ('Class', 'DataType', 'Enumeration')
      AND destination.Object_Type in ('Class', 'DataType', 'Enumeration')`;

  const eaConnectors = (<any[]>alasql(query, [connectors, objects, objects])).map(item => new EaConnector(
    <number>item.Connector_ID,
    <string>item.ea_guid,
    <string>item.Name,
    <string>item.Connector_Type,
    <number>item.Start_Object_ID,
    <number>item.End_Object_ID,
    <string>item.SourceCard,
    <string>item.DestCard,
    <string>item.SourceRole,
    <string>item.DestRole,
    Number.parseInt(<string>item.PDATA1, 10) || null,
    convertToConnectorDirection(<string>item.Direction),
  ));

  eaConnectors.forEach(connector => setElementConnectorLoaderPath(connector, elements));

  const connectorTags = reader.getTable(EaTable.ConnectorTag).getData();
  addEaTagsToElements(connectorTags, eaConnectors, 'ElementID', 'VALUE');

  const roleTags = reader.getTable(EaTable.ConnectorRoleTag).getData();
  addRoleTagsToElements(roleTags, eaConnectors);

  return eaConnectors;
}

function setElementConnectorLoaderPath(connector: EaConnector, elements: EaElement[]): void {
  let path: string;
  const sourceObject = elements.find(x => x.id === connector.sourceObjectId);

  if (!sourceObject) {
    // Log error
    return;
  }

  if (connector.name) {
    path = `${sourceObject.path}:${connector.name}`;
  } else {
    const destinationObject = elements.find(x => x.id === connector.destinationObjectId);

    if (!destinationObject) {
      // Log error
      return;
    }

    path = `${sourceObject.path}:(${sourceObject.name} -> ${destinationObject.name})`;
  }

  connector.path = path;
}