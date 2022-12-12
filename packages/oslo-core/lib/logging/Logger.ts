import { injectable } from 'inversify';
import type { LogLevel } from './LogLevel';

export interface Logger {
  log: (level: LogLevel, message: string) => Logger;
  error: (message: string) => Logger;
  warn: (message: string) => Logger;
  info: (message: string) => Logger;
  verbose: (message: string) => Logger;
  debug: (message: string) => Logger;
  silly: (message: string) => Logger;
}

@injectable()
export abstract class BaseLogger implements Logger {
  public abstract log(level: LogLevel, message: string): Logger;

  public error(message: string): Logger {
    return this.log('error', message);
  }

  public warn(message: string): Logger {
    return this.log('warn', message);
  }

  public info(message: string): Logger {
    return this.log('info', message);
  }

  public verbose(message: string): Logger {
    return this.log('verbose', message);
  }

  public debug(message: string): Logger {
    return this.log('debug', message);
  }

  public silly(message: string): Logger {
    return this.log('silly', message);
  }
}
