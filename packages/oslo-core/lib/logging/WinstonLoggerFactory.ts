import { createLogger, transports, format } from 'winston';
import type * as Transport from 'winston-transport';
import type { Logger } from './Logger';
import type { LoggerFactory } from './LoggerFactory';
import type { LogLevel } from './LogLevel';
import { WinstonLogger } from './WinstonLogger';
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
      transports: [
        new transports.Console(),
      ],
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
