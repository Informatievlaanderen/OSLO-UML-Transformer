/**
 * @group unit
 */
import 'reflect-metadata';
import { BaseLogger } from '../lib/logging/Logger';

describe('Logger', () => {
  describe('a BaseLogger', () => {
    let logger: BaseLogger;

    beforeEach(() => {
      logger = new (<any>BaseLogger)();
      logger.log = jest.fn();
    });

    it('delegates error to log.', async (): Promise<void> => {
      logger.error('my message');
      expect(logger.log).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('error', 'my message');
    });

    it('warn delegates to log.', async (): Promise<void> => {
      logger.warn('my message');
      expect(logger.log).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('warn', 'my message');
    });

    it('info delegates to log.', async (): Promise<void> => {
      logger.info('my message');
      expect(logger.log).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('info', 'my message');
    });

    it('verbose delegates to log.', async (): Promise<void> => {
      logger.verbose('my message');
      expect(logger.log).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('verbose', 'my message');
    });

    it('debug delegates to log.', async (): Promise<void> => {
      logger.debug('my message');
      expect(logger.log).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('debug', 'my message');
    });

    it('silly delegates to log.', async (): Promise<void> => {
      logger.silly('my message');
      expect(logger.log).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith('silly', 'my message');
    });
  });
});
