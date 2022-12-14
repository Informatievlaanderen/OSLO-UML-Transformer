/**
 * @group unit
*/
import 'reflect-metadata';
import { WinstonLogger } from '../lib/logging/WinstonLogger';

describe('WinstonLogger', () => {
  let logger: WinstonLogger;
  let spy: any;
  beforeEach(async (): Promise<void> => {
    logger = new (<any>WinstonLogger)('info');
    spy = jest.spyOn((<any>logger).logger, 'log');
  });

  it('delegates log invocations to the inner logger', () => {
    expect(logger.log('debug', 'my message')).toBe(logger);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('debug', 'my message');
  });
});
