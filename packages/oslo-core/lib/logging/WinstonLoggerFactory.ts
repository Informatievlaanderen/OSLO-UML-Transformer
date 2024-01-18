import { createLogger, transports, format } from 'winston';
import type * as Transport from 'winston-transport';
import type { Logger } from '@oslo-core/logging/Logger';
import type { LoggerFactory } from '@oslo-core/logging/LoggerFactory';
import type { LogLevel } from '@oslo-core/logging/LogLevel';
import { WinstonLogger } from '@oslo-core/logging/WinstonLogger';
const { combine, colorize, printf } = format;

const messageFormat = printf(({ level, message, messageTimestamp }) => `${new Date(Date.now()).toISOString()} ${level}: ${message}`);

export class WinstonLoggerFactory implements LoggerFactory {
  private readonly level: LogLevel;

  public constructor(level: LogLevel) {
    this.level = level;
  }

  public createLogger(label?: string): Logger {
    return new WinstonLogger(createLogger({
      level: this.level,
      transports: this.createTransports(),
      format: combine(
        colorize(),
        messageFormat,
      ),
    }));
  }

  protected createTransports(): Transport[] {
    return [new transports.Console()];
  }
}
