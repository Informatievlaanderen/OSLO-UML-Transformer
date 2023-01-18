import type { IConfiguration } from './IConfiguration';

/**
 * Interface that must be implemented by classes that use an RDF file as input and generates an artefact
 */
export interface IGenerationService {
  configuration: IConfiguration;
  run: () => Promise<void>;
}
