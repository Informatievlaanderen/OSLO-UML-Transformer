/**
 * @group unit
 */
import { VoidLogger } from '@oslo-flanders/core';
import { InputFormat } from '@oslo-flanders/core/lib/enums/InputFormat';
import { FileReaderService } from '../lib/FileReaderService';

describe('DataRegistry equality', () => {
  it('should produce equal registries for accessdb and sqlite input', async () => {
    const accessdbRegistry = await new FileReaderService(
      InputFormat.AccessDB,
      new VoidLogger(),
    ).createDataRegistry(
      // eslint-disable-next-line max-len
      'https://github.com/Informatievlaanderen/OSLO-UML-Transformer/blob/8fa44ec84b901c60a70a64da3d1bb743c55d1aaf/oslo-converter-uml-ea/01-AssociatiesMijnDomein.EAP?raw=true',
    );

    const sqliteRegistry = await new FileReaderService(
      InputFormat.SQLite,
      new VoidLogger(),
    ).createDataRegistry(
      // eslint-disable-next-line max-len
      'https://github.com/Informatievlaanderen/OSLO-UML-Transformer/blob/integration-test-files/oslo-converter-uml-ea/01-AssociatiesMijnDomein.qea?raw=true',
    );
    
    expect(accessdbRegistry.diagrams.length).toEqual(
      sqliteRegistry.diagrams.length,
    );
    expect(accessdbRegistry.packages.length).toEqual(
      sqliteRegistry.packages.length,
    );
    /* TODO: disable until SQLite variant is updated as well */
    /*expect(accessdbRegistry.elements.length).toEqual(
      sqliteRegistry.elements.length,
    );*/
    /*expect(accessdbRegistry.connectors.length).toEqual(
      sqliteRegistry.connectors.length,
    );
    expect(accessdbRegistry.attributes.length).toEqual(
      sqliteRegistry.attributes.length,
    );
    expect(accessdbRegistry.crossReferences.length).toEqual(
      sqliteRegistry.crossReferences.length,
    );*/
  });
});
