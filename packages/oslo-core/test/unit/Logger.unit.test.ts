import { Logger } from '../../lib/logging/Logger';

describe('Logger', (): void => {
  let logger: Logger;
  let meta: any;

  beforeEach(async (): Promise<void> => {
    logger = new (<any>Logger)('Logger.test.ts');
    meta = { a: 123 };

    logger.log = jest.fn();
  });

  it('should internally delegate to winston log', async () => {
    const myLogger = new (<any>Logger)('Logger.test.ts');
    const spy = jest.spyOn(myLogger.logger, 'log');
    myLogger.info('my message', meta);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should delegate warn to log', async () => {
    logger.warn('my message', meta);

    expect(logger.log).toHaveBeenCalledTimes(1);
    expect(logger.log).toHaveBeenCalledWith('warn', 'my message', meta);
  });

  it('should delegate error to log', async () => {
    logger.error('my message', meta);

    expect(logger.log).toHaveBeenCalledTimes(1);
    expect(logger.log).toHaveBeenCalledWith('error', 'my message', meta);
  });

  it('should delegate info to log', async () => {
    logger.info('my message', meta);

    expect(logger.log).toHaveBeenCalledTimes(1);
    expect(logger.log).toHaveBeenCalledWith('info', 'my message', meta);
  });

  it('should delegate debug to log', async () => {
    logger.debug('my message', meta);

    expect(logger.log).toHaveBeenCalledTimes(1);
    expect(logger.log).toHaveBeenCalledWith('debug', 'my message', meta);
  });
});