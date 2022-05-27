import { Logger } from './Logger';

export class LoggerFactory {
  private static readonly instance = new LoggerFactory();

  private constructor() {
    // Singleton instance
  }

  public static getInstance(): LoggerFactory {
    return LoggerFactory.instance;
  }

  public createLogger(loggable: string): Logger {
    return new Logger(loggable);
  }
}