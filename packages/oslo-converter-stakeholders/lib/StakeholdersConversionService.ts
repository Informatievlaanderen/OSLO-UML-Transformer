import { writeFile } from 'fs/promises';
import type { IService } from '@oslo-flanders/core';
import type {
  StakeholdersDocument,
  Stakeholder,
} from './interfaces/StakeholdersDocument';
import { fetchFileOrUrl, Logger, ServiceIdentifier } from '@oslo-flanders/core';

import { parse } from 'csv-parse';
import { inject, injectable } from 'inversify';
import { StakeholdersConversionServiceConfiguration } from './config/StakeholdersConversionServiceConfiguration';
import { ContributorType } from './enums/ContributorType';
import { context } from './utils/JsonLdContext';
import { ToJsonTransformer } from './utils/ToJsonTransformer';
@injectable()
export class StakeholdersConversionService implements IService {
  public readonly logger: Logger;
  public readonly configuration: StakeholdersConversionServiceConfiguration;

  public constructor(
    @inject(ServiceIdentifier.Logger) logger: Logger,
    @inject(ServiceIdentifier.Configuration)
    config: StakeholdersConversionServiceConfiguration,
  ) {
    this.logger = logger;
    this.configuration = config;
  }

  public async init(): Promise<void> {
    // Nothing to init here
  }

  public async run(): Promise<void> {
    const data = await fetchFileOrUrl(this.configuration.input);
    const { authors, contributors, editors } = await this.parseData(data);

    const doc: StakeholdersDocument = this.createDocument(
      authors,
      contributors,
      editors,
    );

    await writeFile(this.configuration.output, JSON.stringify(doc, null, 2));
  }

  // helper methods for creating the StakeholdersDocument in the different output formats
  private createJsonLdDocument(
    authors: Stakeholder[],
    contributors: Stakeholder[],
    editors: Stakeholder[],
  ): StakeholdersDocument {
    const doc: StakeholdersDocument = {};
    doc['@context'] = context;
    doc.contributors = contributors;
    doc.authors = authors;
    doc.editors = editors;
    return doc;
  }

  private createJsonDocument(
    authors: Stakeholder[],
    contributors: Stakeholder[],
    editors: Stakeholder[],
  ): StakeholdersDocument {
    const doc: StakeholdersDocument = {};
    doc.contributors = contributors;
    doc.authors = authors;
    doc.editors = editors;
    return doc;
  }

  private createDocument(
    authors: Stakeholder[],
    contributors: Stakeholder[],
    editors: Stakeholder[],
  ): StakeholdersDocument {
    switch (this.configuration.outputFormat) {
      case 'application/json':
        return this.createJsonDocument(authors, contributors, editors);
      case 'application/ld+json':
        return this.createJsonLdDocument(authors, contributors, editors);
      default:
        return this.createJsonLdDocument(authors, contributors, editors);
    }
  }

  private sortStakeholdersByLastName(
    stakeholders: Stakeholder[],
  ): Stakeholder[] {
    return stakeholders.sort((a, b) => a.lastName.localeCompare(b.lastName));
  }

  private async parseData(data: Buffer): Promise<{
    authors: Stakeholder[];
    contributors: Stakeholder[];
    editors: Stakeholder[];
  }> {
    const parser = parse({ delimiter: ';', columns: true });
    parser.on('error', (error: any) => {
      this.logger.error(
        `[CsvConverterHandler] Unable to convert the provided csv into a stakeholders-file. ${error} for record ${error?.record}`,
      );
    });
    const transformer = new ToJsonTransformer(this.configuration.outputFormat);

    const contributors: Stakeholder[] = [];
    const authors: Stakeholder[] = [];
    const editors: Stakeholder[] = [];

    await new Promise<void>((resolve, reject) => {
      parser
        .pipe(transformer)
        .on('data', (object: any) => {
          switch (object.contributorType) {
            case ContributorType.Author:
              authors.push(object);
              break;
            case ContributorType.Contributor:
              contributors.push(object);
              break;
            case ContributorType.Editor:
              editors.push(object);
              break;
            default:
              this.logger.error(
                `Unable to find the contributor type for "${object.firstName} ${object.lastName}."`,
              );
          }

          delete object.contributorType;
        })
        .on('error', (error: unknown) => reject(error))
        .on('end', () => resolve());

      parser.write(data);
      parser.end();
    });

    return {
      authors: this.sortStakeholdersByLastName(authors),
      contributors: this.sortStakeholdersByLastName(contributors),
      editors: this.sortStakeholdersByLastName(editors),
    };
  }
}
