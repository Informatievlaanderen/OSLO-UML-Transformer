import { getLoggerFor } from '@oslo-flanders/core';
import { ConnectorDirection } from '../enums/ConnectorDirection';

/**
 * Resolves the direction of a connector by applying a regular expression on the geometry field of a connector.
 * @param geometry - The geometry string of a connector.
 * @returns - The direction of the connector.
 * @see ConnectorDirection for the possible direction values.
 */
export function resolveConnectorDirection(geometry: string): ConnectorDirection {
  const logger = getLoggerFor(`ResolveConnectorDirectionFunction`);
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
          logger.error(`Could not resolve connector direction of geometry '${geometry}'. Returning connector direction 'Unknown'.`);
          labelDirection = ConnectorDirection.Unknown;
      }
    }
  }

  return labelDirection;
}

export function convertToConnectorDirection(direction: string): ConnectorDirection {
  const logger = getLoggerFor(`ConvertToConnectorDirectionFunction`);

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
      logger.error(`Direction string '${direction}' could not be mapped to connector direction enum. Returning connector direction 'Unknown'.`);
      return ConnectorDirection.Unknown;
  }
}
