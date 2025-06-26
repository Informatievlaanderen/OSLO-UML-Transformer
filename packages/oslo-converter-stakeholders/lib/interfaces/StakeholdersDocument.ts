import type { ContributorType } from '../enums/ContributorType';

export interface StakeholdersDocument {
    '@context'?: object;
    '@graph'?: object[];
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
    email?: string;
    contributorType: ContributorType;
}

export interface Person extends Pick<Stakeholder, '@type' | 'firstName' | 'lastName'> {
    email?: { '@id': string };
    member?: { '@id': string };
}

export interface Organization {
    '@id': string;
    '@type'?: string;
    name: string;
}
