import type { Logger } from './Logger';
import { LoggerFactory } from './LoggerFactory';

export function getLoggerFor(loggable: string | Instance): Logger {
  return LoggerFactory.getInstance().createLogger(typeof loggable === 'string' ? loggable : loggable.constructor.name);
}

interface Instance {
  constructor: { name: string };
}