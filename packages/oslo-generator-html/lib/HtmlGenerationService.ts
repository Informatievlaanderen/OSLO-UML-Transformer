import { writeFile, mkdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import { sortClasses } from './utils/utils';
import { IService, Scope } from '@oslo-flanders/core';
import { Logger, ServiceIdentifier, fetchFileOrUrl } from '@oslo-flanders/core';
import { inject, injectable } from 'inversify';
import * as nj from 'nunjucks';
import { HtmlGenerationServiceConfiguration } from './config/HtmlGenerationServiceConfiguration';
import { SpecificationType } from './utils/specificationTypeEnum';
import { Class } from './types/Class';
import { Languages } from './utils/languageEnum';

@injectable()
export class HtmlGenerationService implements IService {
  public readonly logger: Logger;
  public readonly configuration: HtmlGenerationServiceConfiguration;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration)
    config: HtmlGenerationServiceConfiguration,
  ) {
    this.logger = logger;
    this.configuration = config;
  }

  public async init(): Promise<void> {
    const env = nj.configure(resolve(`${__dirname}/templates`));
    env.addGlobal('getAnchorTag', this.getAnchorTag);
  }

  public async run(): Promise<void> {
    const [config, stakeholders] = await Promise.all([
      this.readConfigFile(this.configuration.input),
      this.readConfigFile(this.configuration.stakeholders),
    ]);

    const indexPath =
      this.configuration.specificationType === SpecificationType.Vocabulary
        ? 'vocabulary/index.njk'
        : 'application-profile/index.njk';

    let data: any = {};
    const languageKey: Languages =
      Languages[<keyof typeof Languages>this.configuration.language];
    // AP

    const { classes, dataTypes } = config;

    data.entities = this.filterEntities(classes);

    data.scopedDataTypes = this.filterClasses(dataTypes, this.isScoped);

    data.inPackageDataTypes = this.filterClasses(dataTypes, this.isInPackage);
    data.inPackageClasses = this.filterClasses(classes, this.isInPackage);
    data.inPackageMerged = this.mergeAndSortClasses(
      data.inPackageDataTypes,
      data.inPackageClasses,
      languageKey,
    );
    data.inPackageProperties = this.filterAndFlattenProperties(
      data.inPackageMerged,
      this.isInPackage,
    );

    data.metadata = {
      title: 'Vrachtwagenparkeren: Vocabularium',
      uri: 'https://data.vlaanderen.be/ns/vrachtwagenparkeren',
      issued: '2023-11-30',
      filename: 'Vrachtwagenparkeren',
      navigation: {
        self: 'https://data.test-vlaanderen.be/doc/vocabularium/vrachtwagenparkeren/ontwerpstandaard/2023-11-30',
      },
      license:
        'https://data.vlaanderen.be/id/licentie/modellicentie-gratis-hergebruik/v1.0',
      documenttype: 'voc',
      documentconfig: {},
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
      statuslabel: 'Ontwerp Standaard',
      repositoryurl:
        'https://github.com/Informatievlaanderen/OSLOthema-vrachtwagenParkeren/tree/cfe84f9cbcd70d7ab4776a4445d96aeb4c2be260',
      changelogurl:
        'https://github.com/Informatievlaanderen/OSLOthema-vrachtwagenParkeren/blob/cfe84f9cbcd70d7ab4776a4445d96aeb4c2be260/CHANGELOG',
      feedbackurl:
        'https://github.com/Informatievlaanderen/OSLOthema-vrachtwagenParkeren/issues',
      standaardregisterurl:
        'https://data.test-vlaanderen.be/doc/vocabularium/vrachtwagenparkeren/ontwerpstandaard/2023-05-05',
      usesVocs: [],
      usesAPs: [],
    };

    data.externalClasses = this.filterClasses(classes, this.isExternal);
    data.externalDataTypes = this.filterClasses(dataTypes, this.isExternal);
    data.externalMerged = this.mergeAndSortClasses(
      data.externalDataTypes,
      data.externalClasses,
      languageKey,
    );
    data.externalProperties = sortClasses(
      this.filterAndFlattenProperties(data.externalMerged, this.isExternal),
      languageKey,
    );

    data.stakeholders = stakeholders;

    const html = nj.render(indexPath, {
      specName: this.configuration.specificationName,
      config,
      data,
    });

    const dirPath = dirname(this.configuration.output);
    await mkdir(dirPath, { recursive: true });

    await writeFile(this.configuration.output, html);
  }

  // private toPascalCase = (str: string): string => {
  //   console.log('str:', str.split(' ').map((word) => word.charAt(0).toUpperCase()));
  //   return str
  //     .split(' ')
  //     .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  //     .join('');
  // };

  // Utility functions
  isInPackage: (c: Class) => boolean = (c: Class) =>
    c?.scope === Scope.InPackage;
  isExternal = (c: Class) => c?.scope === Scope.External;
  isInPublicationEnvironment = (c: Class) =>
    c?.scope === Scope.InPublicationEnvironment;
  isScoped = (c: Class) => !!c?.scope;

  private filterEntities = (entities: Class[]): Class[] =>
    entities.filter(
      (c) => this.isInPackage(c) || this.isInPublicationEnvironment(c),
    );

  private mergeAndSortClasses = (
    dataTypes: Class[],
    classes: Class[],
    language: Languages,
  ): Class[] => {
    const merged = [...dataTypes, ...classes];
    return sortClasses(merged, language);
  };

  private filterAndFlattenProperties = (
    entities: Class[],
    filter: (entity: Class) => boolean,
  ): Class[] => {
    return entities.flatMap((entity) => entity.properties).filter(filter);
  };

  private filterClasses = (
    classes: Class[],
    filter: (c: Class) => boolean,
  ): Class[] => classes.filter(filter);

  private getAnchorTag = (id: string, type: string) => {
    let domain: string = '';
    // AP can be less strict since it's only being used for internal navigation
    // if (type === 'AP') {
    //   return this.toPascalCase(id);
    // }
    // VOC needs to be strict since it's being used for external navigation
    if (id && id?.includes('#')) {
      domain = `${id?.split('#').pop()}`;
    }
    return domain;
  };

  private async readConfigFile(file: string): Promise<any> {
    try {
      const buffer: Buffer = await fetchFileOrUrl(file);
      const fileContent = buffer.toString();
      const configObject = JSON.parse(fileContent);
      return configObject;
    } catch (error) {
      console.error('Error reading or parsing config file:', error);
      throw error;
    }
  }
}
