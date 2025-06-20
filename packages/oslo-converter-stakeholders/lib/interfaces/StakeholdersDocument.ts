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
    email: string;
    contributorType: ContributorType;
}

export interface Person {
    '@type'?: string;
    firstName: string;
    lastName: string;
    email: object;
    member: object;
}

export interface Organization {
    '@id'?: string;
    '@type'?: string;
    name: string;
}
