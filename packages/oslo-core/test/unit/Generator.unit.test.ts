// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-empty-function */
import { Generator } from '../../lib/interfaces/Generator';

class MockGenerator extends Generator<any> {
  public async generate(data: string): Promise<void> { }
}

describe('Generator', () => {
  const config = {
    input: 'test',
  };

  const data = {
    '@context': {
      label: 'http://example.org/label',
    },
    '@id': 'http://example.org/id/test/1',
    '@type': 'http://example.org/MockGenerator',
    label: [
      {
        '@language': 'nl',
        '@value': 'test',
      },
      {
        '@language': 'en',
        '@value': 'test',
      },
    ],
  };

  let generator: MockGenerator;

  beforeEach(() => {
    generator = new MockGenerator();
  });

  it('should throw an error when configuration is not set yet', async () => {
    expect(() => generator.configuration).toThrow(Error);
  });

  it('should initialize a configuration', async () => {
    await generator.init(config);

    const generatorConfig = generator.configuration;
    expect(generatorConfig).toEqual(config);
  });

  it('should initialize an N3.Store with language filtered triples', async () => {
    const store = await generator.createRdfStore(JSON.stringify(data), 'nl');

    expect(store.countQuads(null, 'http://example.org/label', null, null)).toBe(1);
  });
});
