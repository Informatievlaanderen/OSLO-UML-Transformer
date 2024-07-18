import { writeFile, mkdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import { IService, Scope } from '@oslo-flanders/core';
import { Logger, ServiceIdentifier, fetchFileOrUrl } from '@oslo-flanders/core';
import { inject, injectable } from 'inversify';
import * as nj from 'nunjucks';
import { HtmlGenerationServiceConfiguration } from './config/HtmlGenerationServiceConfiguration';
import { SpecificationType } from './utils/specificationTypeEnum';
import { Class } from './types/Class';

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

    data.inScopeClasses = this.filterInScopeClasses(config.classes);
    data.entities = this.filterEntities(config.classes);
    data.dataTypes = this.filterDatatypes(config.dataTypes);
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
  isInPackage = (c: Class) => c?.scope === Scope.InPackage;
  isExternal = (c: Class) => c?.scope === Scope.External;
  isInPublicationEnvironment = (c: Class) =>
    c?.scope === Scope.InPublicationEnvironment;
  isScoped = (c: Class) => c?.scope;

  private filterEntities = (entities: Class[]): Class[] =>
    entities.filter(
      (c) => this.isInPackage(c) || this.isInPublicationEnvironment(c),
    );

  private filterInScopeClasses = (classes: Class[]): Class[] =>
    classes.filter(this.isInPackage);

  private filterDatatypes = (dataTypes: Class[]): Class[] =>
    dataTypes.filter(this.isScoped);

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
