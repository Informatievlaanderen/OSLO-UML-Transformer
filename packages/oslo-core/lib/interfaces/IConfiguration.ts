import { YargsParams } from "./AppRunner";

/**
 * Interface that must be implemented by classes that contain configuration properties
 */
export interface IConfiguration {
  createFromCli: (params: YargsParams) => Promise<void>;
}