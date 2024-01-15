import type { Logger } from './Logger';
import type { LoggerFactory } from './LoggerFactory';
import type { LogLevel } from './LogLevel';
import { VoidLoggerFactory } from './VoidLoggerFactory';
import { WinstonLoggerFactory } from './WinstonLoggerFactory';
import type { YargsParams } from '@interfaces/AppRunner';

let loggerFactory: LoggerFactory = new VoidLoggerFactory();

export function createLogger(): Logger {
  return loggerFactory.createLogger();
}

export function setLoggerFactory(params: YargsParams): void {
  if (!params.silent) {
    loggerFactory = new WinstonLoggerFactory(<LogLevel>params.logLevel);
  }
}
