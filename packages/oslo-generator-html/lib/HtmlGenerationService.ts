import { writeFile, mkdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import { IService } from '@oslo-flanders/core';
import { Logger, ServiceIdentifier, fetchFileOrUrl } from '@oslo-flanders/core';
import { inject, injectable } from 'inversify';
import * as nj from 'nunjucks';
import { HtmlGenerationServiceConfiguration } from './config/HtmlGenerationServiceConfiguration';
import { SpecificationType } from './utils/specificationTypeEnum';

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
    const dirs: string[] = [resolve(`${__dirname}/templates`)];
    if (this.configuration.templates) {
      let templatesPath = this.configuration.templates;

      // Ensure the path ends with a trailing slash
      if (!templatesPath.endsWith('/')) {
        templatesPath += '/';
      }

      const customTemplatesDir: string = resolve(templatesPath);
      dirs.push(customTemplatesDir);
    }

    const env = nj.configure(dirs);
    env.addGlobal('getAnchorTag', this.getAnchorTag);
  }

  public async run(): Promise<void> {
    const [config, stakeholders, metadata] = await Promise.all([
      this.readConfigFile(this.configuration.input),
      this.readConfigFile(this.configuration.stakeholders),
      this.readConfigFile(this.configuration.metadata),
    ]);

    const indexPath =
      this.configuration.rootTemplate ||
      (this.configuration.specificationType === SpecificationType.Vocabulary
        ? 'voc2.j2'
        : 'ap2.j2');

    let data: any = {};

    const {
      entities,
      inPackageClasses,
      inPackageDataTypes,
      scopedDataTypes,
      externalProperties,
      inPackageProperties,
      inPackageMerged,
    } = config;

    data = {
      ...data,
      entities,
      inPackageMerged,
      inPackageClasses,
      scopedDataTypes,
      inPackageDataTypes,
      inPackageProperties,
      externalProperties,
      metadata,
      stakeholders,
    };

    const html = nj.render(indexPath, {
      specName: this.configuration.specificationName,
      config,
      data,
    });

    const dirPath = dirname(this.configuration.output);
    await mkdir(dirPath, { recursive: true });

    await writeFile(this.configuration.output, html);
  }

  private getAnchorTag = (id: string, type: string) => {
    let domain: string = '';
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
