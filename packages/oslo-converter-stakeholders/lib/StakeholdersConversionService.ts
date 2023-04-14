/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/indent */
import { writeFile } from 'fs/promises';
import type { IService } from '@oslo-flanders/core';
import { fetchFileOrUrl, Logger, ServiceIdentifier } from '@oslo-flanders/core';

import { parse } from 'csv-parse';
import { inject, injectable } from 'inversify';
import { StakeholdersConversionServiceConfiguration } from './config/StakeholdersConversionServiceConfiguration';
import { ContributorType } from './enums/ContributorType';
import { context } from './utils/JsonLdContext';
import { ToJsonLdTransformer } from './utils/ToJsonLdTransformer';

@injectable()
export class StakeholdersConversionService implements IService {
  public readonly logger: Logger;
  public readonly configuration: StakeholdersConversionServiceConfiguration;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration) config: StakeholdersConversionServiceConfiguration,
  ) {
    this.logger = logger;
    this.configuration = config;
  }

  public async init(): Promise<void> {
    // Nothing to init here
  }

  public async run(): Promise<void> {
    const data = await fetchFileOrUrl(this.configuration.input);
    const parser = parse({ delimiter: ';', columns: true });
    const transformer = new ToJsonLdTransformer();

    const contributors: any[] = [];
    const authors: any[] = [];
    const editors: any[] = [];

    await new Promise<void>((resolve, reject) => {
      parser.pipe(transformer)
        .on('data', (object: any) => {
          if (object.contributorType === ContributorType.Author) {
            authors.push(object);
          } else if (object.contributorType === ContributorType.Contributor) {
            contributors.push(object);
          } else if (object.contributorType === ContributorType.Editor) {
            editors.push(object);
          } else {
            this.logger.error(`Unable to find the contributor type for "${object.firstName} ${object.lastName}."`);
          }

          delete object.contributorType;
        })
        .on('error', (error: unknown) => reject(error))
        .on('end', () => resolve());

      parser.write(data);
      parser.end();
    });

    const doc: any = {};
    doc['@context'] = context;
    doc.contributors = contributors;
    doc.authors = authors;
    doc.editors = editors;

    await writeFile(this.configuration.output, JSON.stringify(doc, null, 2));
  }
}
