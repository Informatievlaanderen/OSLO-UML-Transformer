import { injectable } from 'inversify';
import type { Logger } from './Logger';
import { BaseLogger } from './Logger';
import type { LogLevel } from './LogLevel';

@injectable()
export class VoidLogger extends BaseLogger {
  public constructor() {
    super();
  }

  public log(level: LogLevel, message: string): Logger {
    return this;
  }
}
