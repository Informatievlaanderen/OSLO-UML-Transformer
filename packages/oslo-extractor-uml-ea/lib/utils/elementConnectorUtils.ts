import { ConnectorDirection } from '../enums/ConnectorDirection';
import { EaConnector } from '../types/EaConnector';
import type { EaElement } from '../types/EaElement';

export function mapToElementConnector(
  data: any[],
  elements: EaElement[],
): EaConnector[] {
  const connectors = data.map(
    (item) =>
      new EaConnector(
        <number>item.Connector_ID,
        <string>item.Name,
        <string>item.ea_guid,
        <string>item.Connector_Type,
        <number>item.Start_Object_ID,
        <number>item.End_Object_ID,
        <string>item.SourceCard,
        <string>item.DestCard,
        <string>item.SourceRole,
        <string>item.DestRole,
        <number>item.Package_ID,
        Number.parseInt(<string>item.PDATA1, 10) || null,
        convertToConnectorDirection(<string>item.Direction),
      ),
  );

  connectors.forEach((x) => setElementConnectorLoaderPath(x, elements));

  return connectors;
}

function convertToConnectorDirection(direction: string): ConnectorDirection {
  switch (direction) {
    case 'Source -> Destination':
      return ConnectorDirection.SourceToDest;

    case 'Destination -> Source':
      return ConnectorDirection.DestToSource;

    case 'Bi-Directional':
      return ConnectorDirection.Bidirectional;

    case 'Unspecified':
      return ConnectorDirection.Unspecified;

    default:
      return ConnectorDirection.Unknown;
  }
}

function setElementConnectorLoaderPath(
  connector: EaConnector,
  elements: EaElement[],
): void {
  let path: string;
  const sourceObject = elements.find((x) => x.id === connector.sourceObjectId);

  if (!sourceObject) {
    // TODO: log message
    return;
  }

  if (connector.name) {
    path = `${sourceObject.path}:${connector.name}`;
  } else {
    const destinationObject = elements.find(
      (x) => x.id === connector.destinationObjectId,
    );

    if (!destinationObject) {
      // TODO: log message
      return;
    }

    path = `${sourceObject.path}:(${sourceObject.name} -> ${destinationObject.name})`;
  }

  connector.path = path;
}
