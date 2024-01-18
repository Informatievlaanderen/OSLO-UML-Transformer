import type { IConfiguration } from '@oslo-core/interfaces/IConfiguration';
import type { Logger } from '@oslo-core/logging/Logger';

/**
 * Interface that must be implemented by conversion of generation services
 */
export interface IService {
  logger: Logger;
  configuration: IConfiguration;
  init: () => Promise<void>;
  run: () => Promise<void>;
}
