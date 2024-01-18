import { ConnectorDirection } from '@oslo-extractor-uml-ea/enums/ConnectorDirection';

/**
 * Resolves the direction of a connector by applying a regular expression on the geometry field of a connector.
 * @param geometry - The geometry string of a connector.
 * @returns - The direction of the connector.
 * @see ConnectorDirection for the possible direction values.
 */
export function resolveConnectorDirection(geometry: string): ConnectorDirection {
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

export function convertToConnectorDirection(direction: string): ConnectorDirection {
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
      // TODO: log message
      return ConnectorDirection.Unknown;
  }
}
