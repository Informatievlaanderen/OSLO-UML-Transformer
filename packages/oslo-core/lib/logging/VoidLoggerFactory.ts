import type { LoggerFactory } from './LoggerFactory';
import { VoidLogger } from './VoidLogger';

/**
 * A factory that always returns {@link VoidLogger}, which does nothing on log messages.
 */
export class VoidLoggerFactory implements LoggerFactory {
  private readonly logger = new VoidLogger();

  public createLogger(label?: string): VoidLogger {
    return this.logger;
  }
}
