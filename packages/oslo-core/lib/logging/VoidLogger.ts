import { injectable } from 'inversify';
import type { Logger } from '@oslo-core/logging/Logger';
import { BaseLogger } from '@oslo-core/logging/Logger';
import type { LogLevel } from '@oslo-core/logging/LogLevel';

@injectable()
export class VoidLogger extends BaseLogger {
  public constructor() {
    super();
  }

  public log(level: LogLevel, message: string): Logger {
    return this;
  }
}
