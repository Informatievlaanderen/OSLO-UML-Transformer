import { ConnectorDirection } from '../enums/ConnectorDirection';
import type { EaConnector } from '../types/EaConnector';
import { EaDiagram } from '../types/EaDiagram';
import type { EaPackage } from '../types/EaPackage';
import { resolveConnectorDirection } from './resolveConnectorDirection';

export function mapToEaDiagram(
  data: any[],
  packages: EaPackage[],
): EaDiagram[] {
  const diagrams = data.map(
    (item) =>
      new EaDiagram(
        <number>item.Diagram_ID,
        <string>item.Name,
        <string>item.ea_guid,
        <number>item.Package_ID,
      ),
  );

  diagrams.forEach((x) => setDiagramPath(x, packages));
  return diagrams;
}

export function addElementIdsToDiagram(
  diagramObjects: any[],
  diagrams: EaDiagram[],
): void {
  diagramObjects.forEach((diagramObject) => {
    const diagram = diagrams.find((x) => x.id === diagramObject.Diagram_ID);

    if (!diagram) {
      return;
    }

    diagram.elementIds = diagram.elementIds
      ? [...diagram.elementIds, diagramObject.Object_ID]
      : [diagramObject.Object_ID];
  });
}

export function addConnectorIdsToDiagram(
  diagramConnectors: any[],
  diagrams: EaDiagram[],
  elementConnectors: EaConnector[],
): void {
  diagramConnectors.forEach((diagramConnector) => {
    const diagram = diagrams.find((x) => x.id === diagramConnector.DiagramID);

    if (!diagram) {
      return;
    }

    let direction = ConnectorDirection.Unspecified;

    if (diagramConnector.Geometry === null) {
      return;
    }
    direction = resolveConnectorDirection(<string>diagramConnector.Geometry);

    const connector = elementConnectors.find(
      (x) => x.id === diagramConnector.ConnectorID,
    );

    if (!connector) {
      return;
    }

    connector.diagramGeometryDirection = direction;
    connector.hidden = <boolean>diagramConnector.Hidden;

    diagram.connectorsIds = diagram.connectorsIds
      ? [...diagram.connectorsIds, <number>diagramConnector.ConnectorID]
      : [<number>diagramConnector.ConnectorID];
  });
}

/**
 * Combines a main diagram with side diagrams into a new diagram with the id, name,
 * package and path of the main diagram, and the elements and connectors of all of them.
 * The diagrams themselves are not changed.
 */
export function combineDiagrams(
  mainDiagram: EaDiagram,
  sideDiagrams: EaDiagram[],
): EaDiagram {
  const diagrams = [mainDiagram, ...sideDiagrams];
  const combined = new EaDiagram(
    mainDiagram.id,
    mainDiagram.name,
    mainDiagram.eaGuid,
    mainDiagram.packageId,
  );

  combined.path = mainDiagram.path;
  combined.tags = mainDiagram.tags;
  combined.elementIds = [...new Set(diagrams.flatMap((x) => x.elementIds))];
  combined.connectorsIds = [
    ...new Set(diagrams.flatMap((x) => x.connectorsIds)),
  ];

  return combined;
}

function setDiagramPath(diagram: EaDiagram, packages: EaPackage[]): void {
  const diagramPackage = packages.find(
    (x) => x.packageId === diagram.packageId,
  );
  let path: string;

  if (!diagramPackage) {
    path = diagram.name;
  } else {
    path = `${diagramPackage.path}:${diagram.name}`;
  }

  diagram.path = path;
}
