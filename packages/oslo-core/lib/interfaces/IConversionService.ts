import type { Logger } from '../logging/Logger';
import type { IConfiguration } from './IConfiguration';

/**
 * Interface that must be implemented by classes that convert a UML diagram to an RDF file
 */
export interface IConversionService {
  logger: Logger;
  configuration: IConfiguration;
  run: () => Promise<void>;
}
