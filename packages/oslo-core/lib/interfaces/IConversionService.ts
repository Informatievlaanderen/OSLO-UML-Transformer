import { IConfiguration } from "./IConfiguration";

/**
 * Interface that must be implemented by classes that convert a UML diagram to an RDF file
 */
export interface IConversionService {
  configuration: IConfiguration;
  run: () => Promise<void>;
}