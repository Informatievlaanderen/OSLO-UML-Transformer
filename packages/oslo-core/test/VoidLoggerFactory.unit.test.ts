/**
 * @group unit
 */
import { VoidLogger } from '../lib/logging/VoidLogger';
import { VoidLoggerFactory } from '../lib/logging/VoidLoggerFactory';

describe('VoidLoggerFactory', () => {
  let factory: VoidLoggerFactory;
  beforeEach(async () => {
    factory = new VoidLoggerFactory();
  });

  it('creates VoidLoggers.', async () => {
    const logger = factory.createLogger();
    expect(logger).toBeInstanceOf(VoidLogger);
  });
});
