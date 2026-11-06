/**
 * @group unit
 */
import 'reflect-metadata';
import type { Logger, QuadStore, YargsParams } from '@oslo-flanders/core';
import { areStoresEqual, ns } from '@oslo-flanders/core';
import { InputFormat } from '@oslo-flanders/core/lib/enums/InputFormat';
import { VoidLogger } from '@oslo-flanders/core/lib/logging/VoidLogger';
import { container } from '../lib/config/DependencyInjectionConfig';
import type { EaUmlConverterConfiguration } from '../lib/config/EaUmlConverterConfiguration';
import { EaUmlConverterServiceIdentifier } from '../lib/config/EaUmlConverterServiceIdentifier';
import { EaUmlConversionService } from '../lib/EaUmlConversionService';
import type { OutputHandlerService } from '../lib/OutputHandlerService';

// Diagrams in this file:
//   Hoofd         main diagram, in package MijnDomein
//   Zij           side diagram, in package MijnAPI
//   Gecombineerd  everything of Hoofd and Zij on one diagram, in package MijnDomein
//   Overig        an unrelated diagram
const umlFile =
  // eslint-disable-next-line max-len
  'https://github.com/Informatievlaanderen/OSLO-UML-Transformer/raw/refs/heads/integration-test-files/oslo-converter-uml-ea/10-AssociatiesMijnDomeinMetZijdiagrammen.EAP';

describe('Side diagrams', () => {
  const logger = new VoidLogger();
  let config: EaUmlConverterConfiguration;

  // Runs the whole conversion and returns the store instead of writing it
  const convert = async (
    diagramName: string,
    sideDiagrams: string[] = [],
  ): Promise<QuadStore> => {
    await config.createFromCli(<YargsParams>(<unknown>{
      umlFile,
      diagramName,
      sideDiagrams,
      versionId: 'version/1',
      publicationEnvironment: 'https://data.vlaanderen.be',
      inputFormat: InputFormat.AccessDB,
    }));

    let result: QuadStore | undefined;
    const outputHandlerService = <OutputHandlerService>(<unknown>{
      write: async (store: QuadStore): Promise<void> => {
        result = store;
      },
    });
    await new EaUmlConversionService(
      logger,
      config,
      outputHandlerService,
    ).run();

    // The generation time differs between two conversions
    result!.removeQuads(
      result!.findQuads(null, ns.prov('generatedAtTime'), null),
    );
    return result!;
  };

  // Enumerations are classes in the output as well
  const classLabels = (store: QuadStore): string[] =>
    store
      .getClassIds()
      .map((id) => store.findObject(id, ns.oslo('diagramLabel'))!.value)
      .sort();

  beforeAll(() => {
    if (!container.isBound(EaUmlConverterServiceIdentifier.Logger)) {
      container
        .bind<Logger>(EaUmlConverterServiceIdentifier.Logger)
        .toConstantValue(logger);
    }
    config = container.get<EaUmlConverterConfiguration>(
      EaUmlConverterServiceIdentifier.Configuration,
    );
  });

  it('should convert a main and side diagram as if everything was on the main diagram', async () => {
    const withSideDiagram = await convert('Hoofd', ['Zij']);
    const combined = await convert('Gecombineerd');

    expect(areStoresEqual(withSideDiagram, combined)).toBe(true);
  });

  it('should add the classes of the side diagram', async () => {
    const mainOnly = await convert('Hoofd');
    const withSideDiagram = await convert('Hoofd', ['Zij']);

    expect(classLabels(mainOnly)).toEqual([
      'Adres',
      'Geslacht',
      'Organisatie',
      'Persoon',
    ]);
    expect(classLabels(withSideDiagram)).toEqual([
      'Adres',
      'Envelope',
      'Ernst',
      'Geslacht',
      'Organisatie',
      'Persoon',
      'PersoonEnvelope',
      'Probleem',
    ]);
  });
});
