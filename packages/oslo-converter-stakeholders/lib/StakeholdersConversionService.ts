import { writeFile } from 'fs/promises';
import type { IService } from '@oslo-flanders/core';
import type {
  StakeholdersDocument,
  Stakeholder,
  Person,
  Organization
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
    let authorList: Person[] = [];
    let contributorList: Person[] = [];
    let editorList: Person[] = [];
    let organizationList: Organization[] = [];

    /* Build foaf:Person and foaf:Organization for all */
    for (const author of authors) {
      let person: Person = {
	'@type': author['@type'],
	'firstName': author['firstName'],
	'lastName': author['lastName'],
      };

      if (author['email']) {
        person.email = { '@id': `mailto:${author['email']}` };
      }

      if (author['affiliation']['homepage']) {
        person.member = { '@id': author['affiliation']['homepage'] };

        organizationList.push({
          '@id': author['affiliation']['homepage'],
          '@type': 'Organization',
          'name': author['affiliation']['affiliationName']
        });
      }

      authorList.push(person);
    }

    for (const contributor of contributors) {
      let person: Person = {
	'@type': contributor['@type'],
	'firstName': contributor['firstName'],
	'lastName': contributor['lastName'],
      };

      if (person['email']) {
        person.email = { '@id': `mailto:${contributor['email']}` };
      }

      if (contributor['affiliation']['homepage']) {
        person.member = { '@id': contributor['affiliation']['homepage'] };

        organizationList.push({
          '@id': contributor['affiliation']['homepage'],
          '@type': 'Organization',
          'name': contributor['affiliation']['affiliationName']
        });
      }

      contributorList.push(person);
    }

    for (const editor of editors) {
      let person: Person = {
	'@type': editor['@type'],
	'firstName': editor['firstName'],
	'lastName': editor['lastName'],
      };

      if (editor['email']) {
        person.email = { '@id': `mailto:${editor['email']}` };
      }

      if (editor['affiliation']['homepage']) {
        person.member = { '@id': editor['affiliation']['homepage'] };

        organizationList.push({
          '@id': editor['affiliation']['homepage'],
          '@type': 'Organization',
          'name': editor['affiliation']['affiliationName']
        });
      }

      editorList.push(person);
    }

    /* Build JSON-LD document */
    doc['@context'] = context;
    doc['@graph'] = [{
      '@id': 'http://todo.com/MyDocumentURI',
      '@type': 'DigitalDocument',
      'author': authorList,
      'contributor': contributorList,
      'editor': editorList
    }]
    for (const organization of organizationList) {
      doc['@graph'].push(organization);
    }

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
    const transformer = new ToJsonTransformer(
      this.configuration.outputFormat,
      this.configuration.contributorsColumn,
    );

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
              this.logger.warn(
                `Unable to find the contributor type for "${object?.firstName} ${object?.lastName}" using column "${this.configuration.contributorsColumn}". Please make sure this column has a value set for this person.`,
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
