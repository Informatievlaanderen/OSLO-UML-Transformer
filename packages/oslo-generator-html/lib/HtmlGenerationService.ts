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
  public dirs: string[] = [];

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration)
    config: HtmlGenerationServiceConfiguration,
  ) {
    this.logger = logger;
    this.configuration = config;
  }

  public async init(): Promise<void> {
    if (this.configuration.templates) {
      let templatesPath = this.configuration.templates;

      // Ensure the path ends with a trailing slash
      if (!templatesPath.endsWith('/')) {
        templatesPath += '/';
      }

      const customTemplatesDir: string = resolve(templatesPath);
      this.dirs.push(customTemplatesDir);
    } else {
      this.dirs.push(resolve(`${__dirname}/templates`));
    }

    const env = nj.configure(this.dirs);
    env.addFilter('replaceBaseURI', this.replaceBaseURI);
    env.addGlobal('getAnchorTag', this.getAnchorTag);
  }

  public async run(): Promise<void> {
    let indexPath: string = '';
    const [config, stakeholders, metadata] = await Promise.all([
      this.readConfigFile(this.configuration.input),
      this.readConfigFile(this.configuration.stakeholders),
      this.readConfigFile(this.configuration.metadata),
    ]);

    if (this.configuration.templates && this.configuration.rootTemplate) {
      indexPath = `${this.dirs[0]}/${this.configuration.rootTemplate}`;
    } else {
      indexPath =
        this.configuration.specificationType === SpecificationType.Vocabulary
          ? `${this.dirs[0]}/voc2.j2`
          : `${this.dirs[0]}/ap2.j2`;
    }

    let data: any = {};

    const {
      baseURI,
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
      baseURI,
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
      language: this.configuration.language,
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

  private replaceBaseURI = (input: string, baseURI: string): string => {
    return input.replace(new RegExp(baseURI, 'g'), '');
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
