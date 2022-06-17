// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-empty-function */
import { Converter } from '../../lib/interfaces/Converter';
import { OutputHandler } from '../../lib/interfaces/OutputHandler';

class MockConverter extends Converter<any> {
  public async convert(): Promise<void> { }
}

class MockOutputHandler extends OutputHandler {
  public async write(path: string): Promise<void> { }
}

describe('Converter', () => {
  const config = {
    input: 'test',
  };

  let converter: MockConverter;

  beforeEach(() => {
    converter = new MockConverter();
  });

  it('should initialize a configuration and output handler', async () => {
    converter.init(config, new MockOutputHandler());

    const converterConfig = converter.configuration;
    const converterOutputHandler = converter.outputHandler;

    expect(converterConfig).toEqual(config);
    expect(converterOutputHandler).toBeInstanceOf(MockOutputHandler);
  });

  it('should throw an error when configuration is not set yet', async () => {
    expect(() => converter.configuration).toThrow(Error);
  });

  it('should throw an error when outputHandler is not set yet', async () => {
    expect(() => converter.outputHandler).toThrow(Error);
  });
});
