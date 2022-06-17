import { Logger } from '../../lib/logging/Logger';
import { getLoggerFor } from '../../lib/logging/LogUtil';

class MockClass {
  private readonly label: string;
  public constructor() {
    this.label = 'MyLabel';
  }
}

describe('LogUtil', (): void => {
  it('allow creating a logger for a string label', async (): Promise<void> => {
    expect(getLoggerFor('MyLabel')).toBeInstanceOf(Logger);
    expect((<any>getLoggerFor('MyLabel')).label).toBe('MyLabel');
  });

  it('allow creating a logger for a class instance', async (): Promise<void> => {
    expect(getLoggerFor(new MockClass())).toBeInstanceOf(Logger);
    expect((<any>getLoggerFor(new MockClass())).label).toBe('MockClass');
  });
});
