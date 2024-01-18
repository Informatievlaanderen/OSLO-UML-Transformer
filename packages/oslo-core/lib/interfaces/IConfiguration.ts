import type { YargsParams } from '@oslo-core/interfaces/AppRunner';

/**
 * Interface that must be implemented by classes that contain configuration properties
 */
export interface IConfiguration {
  createFromCli: (params: YargsParams) => Promise<void>;
}
