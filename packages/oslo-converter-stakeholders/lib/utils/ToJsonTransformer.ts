import type { TransformCallback } from 'stream';
import { Transform } from 'stream';
import { ContributorType } from '../enums/ContributorType';

export class ToJsonTransformer extends Transform {
  private readonly columnNames = ['Voornaam', 'Naam', 'Affiliatie', 'E-mail', 'Website'];
  private readonly outputFormat: string;

  public constructor(outputFormat: string) {
    super({
      objectMode: true,
    });
    this.outputFormat = outputFormat;
  }

  public _transform(chunk: any, encoding: string, callback: TransformCallback): void {
    callback(null, this.createContributor(chunk));
  }

  private createContributor(data: any): any {
    const contributor: any = {};

    // If the output format is JSON-LD, we need to add the @type attribute
    if (this.outputFormat === 'application/ld+json') {
      contributor['@type'] = 'Person';
    }

    contributor.firstName = data.Voornaam;
    contributor.lastName = data.Naam;
    contributor.affiliation = {};
    contributor.affiliation.affiliationName = data.Affiliatie;

    if (data.Website) {
      contributor.affiliation.homepage = data.Website;
    }

    contributor.email = data['E-mail'];
    contributor.contributorType = this.getContributorType(data);

    return contributor;
  }

  private getContributorType(data: any): ContributorType {
    let contributorType = ContributorType.Unknown;
    Object.keys(data).forEach(key => {
      if (key !== '' && !this.columnNames.includes(key)) {
        switch (data[key]) {
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
      }
    });

    return contributorType;
  }
}
