/**
 * @group unit
*/
import 'reflect-metadata';
import { WinstonLogger } from '../lib/logging/WinstonLogger';

describe('WinstonLogger', () => {
  let innerLogger: any;
  let logger: WinstonLogger;

  beforeEach(async (): Promise<void> => {
    innerLogger = {
      log: jest.fn(),
    };
    logger = new WinstonLogger(innerLogger);
  });

  it('delegates log invocations to the inner logger', () => {
    expect(logger.log('info', 'a test message')).toBe(logger);
    expect(innerLogger.log).toHaveBeenCalledTimes(1);
    expect(innerLogger.log).toHaveBeenCalledWith('info', 'a test message');
  });
});
