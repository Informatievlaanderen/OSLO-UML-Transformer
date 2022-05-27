import { getLoggerFor } from '../logging/LogUtil';
import type { OutputHandler } from './OutputHandler';

/**
 * Handles the conversion of a UML model to an RDF file
 */
export abstract class Converter<T> {
  protected readonly logger = getLoggerFor(this);
  private _configuration: T | undefined;
  private _outputHandler: OutputHandler | undefined;

  public abstract convert(): Promise<void>;

  public init(config: T, outputHandler: OutputHandler): void {
    this._configuration = config;
    this._outputHandler = outputHandler;
  }

  public get configuration(): T {
    if (!this._configuration) {
      throw new Error(`Configuration not set yet.`);
    }
    return this._configuration;
  }

  public get outputHandler(): OutputHandler {
    if (!this._outputHandler) {
      throw new Error(`OutputHandler not set yet.`);
    }
    return this._outputHandler;
  }
}
