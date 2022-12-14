/**
 * @group unit
*/
import 'reflect-metadata';
import { VoidLogger } from '../lib/logging/VoidLogger';

describe('VoidLogger', () => {
  let logger: VoidLogger;
  beforeEach(async (): Promise<void> => {
    logger = new VoidLogger();
  });

  it('does nothing when log is invoked', () => {
    expect(logger.log('debug', 'my message')).toBe(logger);
  });
});
