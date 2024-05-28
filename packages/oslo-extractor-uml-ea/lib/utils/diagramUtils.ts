import { ConnectorDirection } from '../enums/ConnectorDirection';
import type { EaConnector } from '../types/EaConnector';
import { EaDiagram } from '../types/EaDiagram';
import type { EaPackage } from '../types/EaPackage';

export function mapToEaDiagram(data: any[], packages: EaPackage[]): EaDiagram[] {
  const diagrams = data.map(item => new EaDiagram(
    <number>item.Diagram_ID,
    <string>item.Name,
    <string>item.ea_guid,
    <number>item.Package_ID,
  ));

  diagrams.forEach(x => setDiagramPath(x, packages));
  return diagrams;
}

export function addElementIdsToDiagram(diagramObjects: any[], diagrams: EaDiagram[]): void {
  diagramObjects.forEach(diagramObject => {
    const diagram = diagrams.find(x => x.id === diagramObject.Diagram_ID);

    if (!diagram) {
      return;
    }

    diagram.elementIds = diagram.elementIds ?
      [...diagram.elementIds, diagramObject.Object_ID] :
      [diagramObject.Object_ID];
  });
}

export function addConnectorIdsToDiagram(
  diagramConnectors: any[],
  diagrams: EaDiagram[],
  elementConnectors: EaConnector[],
): void {
  diagramConnectors.forEach(diagramConnector => {
    const diagram = diagrams.find(x => x.id === diagramConnector.DiagramID);

    if (!diagram) {
      return;
    }

    let direction = ConnectorDirection.Unspecified;

    if (diagramConnector.Geometry === null) {
      return;
    }
    direction = resolveConnectorDirection(<string>diagramConnector.Geometry);

    const connector = elementConnectors.find(x => x.id === diagramConnector.ConnectorID);

    if (!connector) {
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
    path = diagram.name;
  } else {
    path = `${diagramPackage.path}:${diagram.name}`;
  }

  diagram.path = path;
}

/**
 * Resolves the direction of a connector by applying a regular expression on the geometry field of a connector.
 * @param geometry - The geometry string of a connector.
 * @returns - The direction of the connector.
 * @see ConnectorDirection for the possible direction values.
 */
function resolveConnectorDirection(geometry: string): ConnectorDirection {
  let labelDirection = ConnectorDirection.Unspecified;

  const labelPattern = /LMT=[^;]+/u;
  const directionPattern = /DIR=(-?[01])/u;

  const label = labelPattern.exec(geometry);

  if (label) {
    const direction = directionPattern.exec(label[0]);

    if (direction) {
      switch (direction[1]) {
        case '0':
          labelDirection = ConnectorDirection.Unspecified;
          break;

        case '1':
          labelDirection = ConnectorDirection.SourceToDest;
          break;

        case '-1':
          labelDirection = ConnectorDirection.DestToSource;
          break;

        default:
          // TODO: log message
          labelDirection = ConnectorDirection.Unknown;
      }
    }
  }
  return labelDirection;
}