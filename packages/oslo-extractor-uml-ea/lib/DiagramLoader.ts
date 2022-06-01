import { getLoggerFor } from '@oslo-flanders/core';
import alasql from 'alasql';
import type MDBReader from 'mdb-reader';
import { ConnectorDirection } from './enums/ConnectorDirection';
import { EaTable } from './enums/EaTable';
import type { EaConnector } from './types/EaConnector';
import { EaDiagram } from './types/EaDiagram';
import type { EaPackage } from './types/EaPackage';
import { resolveConnectorDirection } from './utils/connectorDirectionResolver';

export function loadDiagrams(reader: MDBReader, elementConnectors: EaConnector[], packages: EaPackage[]): EaDiagram[] {
  const diagrams = reader.getTable(EaTable.Diagram).getData();

  const eaDiagrams = diagrams.map(item => new EaDiagram(
    <number>item.Diagram_ID,
    <string>item.Name,
    <string>item.ea_guid,
    <number>item.Package_ID,
  ));

  eaDiagrams.forEach(diagram => setDiagramPath(diagram, packages));

  loadDiagramObjects(reader, eaDiagrams);
  loadDiagramConnectors(reader, eaDiagrams, elementConnectors);

  return eaDiagrams;
}

function loadDiagramObjects(reader: MDBReader, diagrams: EaDiagram[]): void {
  const logger = getLoggerFor('DiagramObjectLoader');
  const diagramObjects = reader.getTable(EaTable.DiagramObject).getData();
  const objects = reader.getTable(EaTable.Object).getData();

  const query = `
    SELECT Diagram_ID, Object_ID
    FROM ? diagramObject
    INNER JOIN ? object ON diagramObject.Object_ID = object.Object_ID
    WHERE object.Object_Type IN ('Class', 'DataType', 'Enumeration')`;

  const filteredDiagramObjects = <any[]>alasql(query, [diagramObjects, objects]);
  filteredDiagramObjects.forEach(diagramObject => {
    const diagram = diagrams.find(x => x.id === diagramObject.Diagram_ID);

    if (!diagram) {
      logger.warn(`Unnable to find diagram to which element with id ${diagramObject.Object_ID} belongs, and will be skipped.`);
      return;
    }

    diagram.elementIds = diagram.elementIds ?
      [...diagram.elementIds, diagramObject.Object_ID] :
      [diagramObject.Object_ID];
  });
}

function loadDiagramConnectors(reader: MDBReader, diagrams: EaDiagram[], elementConnectors: EaConnector[]): void {
  const logger = getLoggerFor('DiagramConnectorLoader');
  const diagramConnectors = reader.getTable(EaTable.DiagramLink).getData();

  diagramConnectors.forEach(diagramConnector => {
    const diagram = diagrams.find(x => x.id === diagramConnector.DiagramID);

    if (!diagram) {
      logger.warn(`Unnable to find diagram to which connector width id ${diagramConnector.ConnectorID} belongs, and will be skipped.`);
      return;
    }

    let direction = ConnectorDirection.Unspecified;

    if (diagramConnector.Geometry === null) {
      logger.error(`Diagram connector has no 'Geometry' value, so its direction can not be resolved, and will be skipped.`);
      return;
    }
    direction = resolveConnectorDirection(<string>diagramConnector.Geometry);

    const connector = elementConnectors.find(x => x.id === diagramConnector.ConnectorID);

    if (!connector) {
      logger.error(`Unnable to find corresponding connector object for connector with id ${diagramConnector.ConnectorID}, and will be skipped.`);
      return;
    }

    connector.diagramGeometryDirection = direction;
    connector.hidden = <boolean>diagramConnector.Hidden;

    diagram.connectorsIds = diagram.connectorsIds ?
      [...diagram.connectorsIds, <number>diagramConnector.ConnectorID] :
      [<number>diagramConnector.ConnectorID];
  });
}

function setDiagramPath(diagram: EaDiagram, packages: EaPackage[]): void {
  const logger = getLoggerFor('DiagramLoader');
  const diagramPackage = packages.find(x => x.packageId === diagram.packageId);
  let path: string;

  if (!diagramPackage) {
    logger.warn(`Unnable to find package to which diagram with EA guid ${diagram.eaGuid} belonags. Setting path to its name '${diagram.name}'.`);
    path = diagram.name;
  } else {
    path = `${diagramPackage.path}:${diagram.name}`;
  }

  diagram.path = path;
}
