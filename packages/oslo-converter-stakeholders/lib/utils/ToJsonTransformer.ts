import type { TransformCallback } from 'stream';
import { Transform } from 'stream';
import { ContributorType } from '../enums/ContributorType';

export class ToJsonTransformer extends Transform {
  private readonly columnNames = [
    'Voornaam',
    'Naam',
    'Affiliatie',
    'E-mail',
    'Website',
  ];
  private readonly outputFormat: string;
  private readonly contributorsColumn: string;

  public constructor(outputFormat: string, contributorsColumn: string) {
    super({
      objectMode: true,
    });
    this.outputFormat = outputFormat;
    this.contributorsColumn = contributorsColumn;
  }

  public _transform(
    chunk: any,
    encoding: string,
    callback: TransformCallback,
  ): void {
    callback(null, this.createContributor(chunk));
  }

  private createContributor(data: any): any {
    const contributor: any = {};

    // If the output format is JSON-LD, we need to add the @type attribute
    if (this.outputFormat === 'application/ld+json') {
      contributor['@type'] = 'Person';
    }

    contributor.firstName = data.Voornaam?.trim();
    contributor.lastName = data.Naam?.trim();
    contributor.affiliation = {};
    contributor.affiliation.affiliationName = data.Affiliatie?.trim();

    if (data.Website) {
      contributor.affiliation.homepage = data.Website?.trim();
    }

    contributor.email = data['E-mail']?.trim();
    contributor.contributorType = this.getContributorType(data);

    return contributor;
  }

  private getContributorType(data: any): ContributorType {
    let contributorType = ContributorType.Unknown;
    // use the column name to determine the contributor type as passed by the CLI to define which column to use for the contributor type
    switch (data[this.contributorsColumn]) {
      case 'A':
        contributorType = ContributorType.Author;
        break;

      case 'C':
        contributorType = ContributorType.Contributor;
        break;

      case 'E':
        contributorType = ContributorType.Editor;
        break;

      default:
        contributorType = ContributorType.Unknown;
        break;
    }

    return contributorType;
  }
}
