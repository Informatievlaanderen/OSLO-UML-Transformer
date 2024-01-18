import type { YargsParams } from '@oslo-core/interfaces/AppRunner';
import type { Logger } from '@oslo-core/logging/Logger';
import type { LoggerFactory } from '@oslo-core/logging/LoggerFactory';
import type { LogLevel } from '@oslo-core/logging/LogLevel';
import { VoidLoggerFactory } from '@oslo-core/logging/VoidLoggerFactory';
import { WinstonLoggerFactory } from '@oslo-core/logging/WinstonLoggerFactory';

let loggerFactory: LoggerFactory = new VoidLoggerFactory();

export function createLogger(): Logger {
  return loggerFactory.createLogger();
}

export function setLoggerFactory(params: YargsParams): void {
  if (!params.silent) {
    loggerFactory = new WinstonLoggerFactory(<LogLevel>params.logLevel);
  }
}
