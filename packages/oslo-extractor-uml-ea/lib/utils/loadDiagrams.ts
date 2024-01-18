import alasql from 'alasql';
import type MDBReader from 'mdb-reader';
import type { DataRegistry } from '@oslo-extractor-uml-ea/DataRegistry';
import { ConnectorDirection } from '@oslo-extractor-uml-ea/enums/ConnectorDirection';
import { EaTable } from '@oslo-extractor-uml-ea/enums/EaTable';
import type { EaConnector } from '@oslo-extractor-uml-ea/types/EaConnector';
import { EaDiagram } from '@oslo-extractor-uml-ea/types/EaDiagram';
import type { EaPackage } from '@oslo-extractor-uml-ea/types/EaPackage';
import { resolveConnectorDirection } from '@oslo-extractor-uml-ea/utils/resolveConnectorDirection';

export function loadDiagrams(mdb: MDBReader, model: DataRegistry): DataRegistry {
  const diagrams = mdb.getTable(EaTable.Diagram).getData();

  model.diagrams = diagrams.map(item => new EaDiagram(
    <number>item.Diagram_ID,
    <string>item.Name,
    <string>item.ea_guid,
    <number>item.Package_ID,
  ));

  model.diagrams.forEach(diagram => setDiagramPath(diagram, model.packages));

  loadDiagramObjects(mdb, model.diagrams);
  loadDiagramConnectors(mdb, model.diagrams, model.connectors);

  return model;
}

function loadDiagramObjects(mdb: MDBReader, diagrams: EaDiagram[]): void {
  // Const logger = getLoggerFor('DiagramObjectLoader');
  const diagramObjects = mdb.getTable(EaTable.DiagramObject).getData();
  const objects = mdb.getTable(EaTable.Object).getData();

  const query = `
    SELECT Diagram_ID, Object_ID
    FROM ? diagramObject
    INNER JOIN ? object ON diagramObject.Object_ID = object.Object_ID
    WHERE object.Object_Type IN ('Class', 'DataType', 'Enumeration')`;

  const filteredDiagramObjects = <any[]>alasql(query, [diagramObjects, objects]);
  filteredDiagramObjects.forEach(diagramObject => {
    const diagram = diagrams.find(x => x.id === diagramObject.Diagram_ID);

    if (!diagram) {
      // TODO: log message
      return;
    }

    diagram.elementIds = diagram.elementIds ?
      [...diagram.elementIds, diagramObject.Object_ID] :
      [diagramObject.Object_ID];
  });
}

function loadDiagramConnectors(reader: MDBReader, diagrams: EaDiagram[], elementConnectors: EaConnector[]): void {
  const diagramConnectors = reader.getTable(EaTable.DiagramLink).getData();

  diagramConnectors.forEach(diagramConnector => {
    const diagram = diagrams.find(x => x.id === diagramConnector.DiagramID);

    if (!diagram) {
      // TODO: log message
      return;
    }

    let direction = ConnectorDirection.Unspecified;

    if (diagramConnector.Geometry === null) {
      // TODO: log message
      return;
    }
    direction = resolveConnectorDirection(<string>diagramConnector.Geometry);

    const connector = elementConnectors.find(x => x.id === diagramConnector.ConnectorID);

    if (!connector) {
      // TODO: log message
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
    // TODO: log message
    path = diagram.name;
  } else {
    path = `${diagramPackage.path}:${diagram.name}`;
  }

  diagram.path = path;
}
