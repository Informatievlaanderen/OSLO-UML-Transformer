/**
 * @group unit
 */
import { fileSync } from 'tmp';
import { fetchFileOrUrl } from '../lib/utils/fetchFileOrUrl';
import { uniqueId } from '../lib/utils/uniqueId';

describe('Util functions', () => {
  it('should fetch a URL and return a Buffer', async () => {
    // eslint-disable-next-line max-len
    const url = 'https://github.com/Informatievlaanderen/OSLO-UML-Transformer/blob/integration-test-files/oslo-converter-uml-ea/01-AssociatiesMijnDomein.EAP?raw=true';
    expect(await fetchFileOrUrl(url)).toBeInstanceOf(Buffer);
  });

  it('should fetch a local file and return a Buffer', async () => {
    const tmpFile = fileSync();
    const tmpFileWithPrefix = `file://${tmpFile.name}`;

    expect(await fetchFileOrUrl(tmpFile.name)).toBeInstanceOf(Buffer);
    expect(await fetchFileOrUrl(tmpFileWithPrefix)).toBeInstanceOf(Buffer);
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
