import type { LoggerFactory } from '@oslo-core/logging/LoggerFactory';
import { VoidLogger } from '@oslo-core/logging/VoidLogger';

/**
 * A factory that always returns {@link VoidLogger}, which does nothing on log messages.
 */
export class VoidLoggerFactory implements LoggerFactory {
  private readonly logger = new VoidLogger();

  public createLogger(label?: string): VoidLogger {
    return this.logger;
  }
}
