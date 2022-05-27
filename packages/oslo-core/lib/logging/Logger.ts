import type { Logger as WinstonLogger } from 'winston';
import { config, createLogger, transports, format } from 'winston';

/**
 * Logs messages on a certain level by using the Winston logger.
 */
export class Logger {
  private readonly logger: WinstonLogger;
  private readonly label: string;

  public constructor(label: string) {
    this.logger = this.createLoggerInstance(label);
    this.label = label;
  }

  public log(level: string, message: string, meta?: any): WinstonLogger {
    return this.logger.log(level, message, meta);
  }

  /**
   * Logs a message at the 'error' level
   * @param message - The message to log
   */
  public error(message: string, meta?: any): WinstonLogger {
    return this.log('error', message, meta);
  }

  /**
   * Logs a message at the 'warn' level
   * @param message - The message to log
   */
  public warn(message: string, meta?: any): WinstonLogger {
    return this.log('warn', message, meta);
  }

  /**
   * Logs a message at the 'info' level
   * @param message - The message to log
   */
  public info(message: string, meta?: any): WinstonLogger {
    return this.log('info', message, meta);
  }

  /**
   * Logs a message at the 'debug' level
   * @param message - The message to log
   */
  public debug(message: string, meta?: any): WinstonLogger {
    return this.log('debug', message, meta);
  }

  private createLoggerInstance(label: string): WinstonLogger {
    const silent = process.env.NODE_ENV === 'test';

    return createLogger({
      levels: config.npm.levels,
      transports: [
        new transports.Console({
          level: 'debug',
          silent,
          format: format.combine(
            format.colorize(),
            format.label({ label }),
            format.timestamp(),
            format.printf(({
              level: levelInner,
              message,
              label: labelInner,
              timestamp,
            }: Record<string, any>): string =>
              `${timestamp} [${labelInner}] ${levelInner}: ${message}`),
          ),
        }),
      ],
    });
  }
}