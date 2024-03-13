import type { ContributorType } from '@oslo-converter-stakeholders/enums/ContributorType';

export interface StakeholdersDocument {
    '@context'?: object;
    contributors?: Stakeholder[];
    authors?: Stakeholder[];
    editors?: Stakeholder[];
}

export interface Stakeholder {
    '@type'?: string;
    firstName: string;
    lastName: string;
    affiliation: {
        affiliationName: string;
        homepage?: string;
    };
    email: string;
    contributorType: ContributorType;
}