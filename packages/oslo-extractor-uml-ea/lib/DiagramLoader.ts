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
    <string>item.ea_guid,
    <string>item.Name,
    <number>item.Package_ID,
  ));

  eaDiagrams.forEach(diagram => setDiagramPath(diagram, packages));

  loadDiagramObjects(reader, eaDiagrams);
  loadDiagramConnectors(reader, eaDiagrams, elementConnectors);

  return eaDiagrams;
}

function loadDiagramObjects(reader: MDBReader, diagrams: EaDiagram[]): void {
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
      // TODO: log error or warning
    } else {
      diagram.elementIds = diagram.elementIds ?
        [...diagram.elementIds, diagramObject.Object_ID] :
        [diagramObject.Object_ID];
    }
  });
}

function loadDiagramConnectors(reader: MDBReader, diagrams: EaDiagram[], elementConnectors: EaConnector[]): void {
  const diagramConnectors = reader.getTable(EaTable.DiagramLink).getData();

  diagramConnectors.forEach(diagramConnector => {
    const diagram = diagrams.find(x => x.id === diagramConnector.DiagramID);

    if (!diagram) {
      // TODO: log error?
      console.log(`Diagram not found for ${JSON.stringify(diagramConnector, null, 4)}`);
      return;
    }

    let direction = ConnectorDirection.Unspecified;

    if (diagramConnector.Geometry === null) {
      // TODO: log error
      return;
    }
    direction = resolveConnectorDirection(<string>diagramConnector.Geometry);

    const connector = elementConnectors.find(x => x.id === diagramConnector.ConnectorID);

    if (!connector) {
      // TODO: log error
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
  const diagramPackage = packages.find(x => x.packageId === diagram.packageId);
  let path: string;

  if (!diagramPackage) {
    // TODO: Log error
    path = diagram.name;
  } else {
    path = `${diagramPackage.path}:${diagram.name}`;
  }

  diagram.path = path;
}
