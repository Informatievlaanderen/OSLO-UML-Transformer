/**
 * @group unit
 */

import { PassThrough } from 'stream';
import type { Logger } from 'winston';
import { LOG_LEVELS } from '../lib/logging/LogLevel';
import { WinstonLogger } from '../lib/logging/WinstonLogger';
import { WinstonLoggerFactory } from '../lib/logging/WinstonLoggerFactory';

describe('WinstonLoggerFactory', () => {
  let factory: WinstonLoggerFactory;

  beforeEach(() => {
    factory = new WinstonLoggerFactory(LOG_LEVELS[2]);
  });

  it('creates WinstonLoggers', async () => {
    const logger = factory.createLogger();
    expect(logger).toBeInstanceOf(WinstonLogger);

    const innerLogger: Logger = (<any>logger).logger;
    expect(innerLogger.level).toBe('info');
    expect(innerLogger.format).toBeTruthy();
  });

  it('allows WinstonLogger to be invoked', async () => {
    const transport: any = new PassThrough({ objectMode: true });
    transport.write = jest.fn();
    transport.log = jest.fn();
    (<any>factory).createTransports = jest.fn().mockReturnValue([transport]);

    const logger = factory.createLogger();
    logger.log('info', 'my message');
    expect(transport.write).toHaveBeenCalledTimes(1);
  });
});
