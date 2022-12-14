import { injectable } from 'inversify';
import type { Logger as WinstonInnerLogger } from 'winston';
import { transports, createLogger, format } from 'winston';
const { combine, colorize, printf } = format;

import { BaseLogger } from './Logger';
import { LogLevel } from './LogLevel';

const messageFormat = printf(({ level, message, messageTimestamp }) => `${new Date(Date.now()).toISOString()} ${level}: ${message}`);

@injectable()
export class WinstonLogger extends BaseLogger {
  private readonly logger: WinstonInnerLogger;

  public constructor(logLevel: LogLevel) {
    super();
    this.logger = createLogger({
      level: logLevel,
      transports: [
        new transports.Console(),
      ],
      format: combine(
        colorize(),
        messageFormat,
      ),
    });
  }

  public log(level: LogLevel, message: string): this {
    this.logger.log(level, message);
    return this;
  }
}
