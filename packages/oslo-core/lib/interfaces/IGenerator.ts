import type { IConfiguration } from './IConfiguration';

/**
 * Interface that must be implemented by classes that use an RDF file as input and generates an artefacts
 */
export interface IGenerator {
  configuration: IConfiguration;
  run: () => Promise<void>;
}
