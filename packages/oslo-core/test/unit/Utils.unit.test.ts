import { fetchFileOrUrl } from '../../lib/utils/fetchFileOrUrl';
import { uniqueId } from '../../lib/utils/uniqueId';

describe('Utils', () => {
  it('should fetch a URL and return a Buffer', async () => {
    // eslint-disable-next-line max-len
    const url = 'https://github.com/Informatievlaanderen/OSLOthema-toolchainTestbed/blob/master/testAssociatiesMijnDomein.EAP?raw=true';
    expect(await fetchFileOrUrl(url)).toBeInstanceOf(Buffer);
  });

  it('should fetch a local file and return a Buffer', async () => {
    const file = `${__dirname}/data/testAssociatiesMijnDomein.EAP`;
    const fileWithPrefix = `file://${file}`;
    expect(await fetchFileOrUrl(file)).toBeInstanceOf(Buffer);
    expect(await fetchFileOrUrl(fileWithPrefix)).toBeInstanceOf(Buffer);
  });

  it('should throw an error when a local file does not exist', async () => {
    await expect(() => fetchFileOrUrl('nonExistingFile.EAP')).rejects.toThrow(Error);
  });

  it('should generate a unique id', async () => {
    const guid = 'test-guid';
    const label = 'test-label';
    const id = 1;

    expect(uniqueId(guid, label, id)).toEqual(uniqueId(guid, label, id));
    expect(uniqueId(guid, label, id)).not.toEqual(uniqueId(guid, label, 2));
  });
});
