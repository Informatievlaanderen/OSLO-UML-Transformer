import { injectable } from 'inversify';
import { Logger as WinstonInnerLogger } from 'winston';

import { BaseLogger } from './Logger';
import type { LogLevel } from './LogLevel';

@injectable()
export class WinstonLogger extends BaseLogger {
  private readonly logger: WinstonInnerLogger;

  public constructor(logger: WinstonInnerLogger) {
    super();
    this.logger = logger;
  }

  public log(level: LogLevel, message: string): this {
    this.logger.log(level, message);
    return this;
  }
}
