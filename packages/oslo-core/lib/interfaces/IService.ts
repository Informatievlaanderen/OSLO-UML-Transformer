import type { Logger } from '../logging/Logger';
import type { IConfiguration } from './IConfiguration';

/**
 * Interface that must be implemented by conversion of generation services
 */
export interface IService {
  logger: Logger;
  configuration: IConfiguration;
  init: () => Promise<void>;
  run: () => Promise<void>;
}
