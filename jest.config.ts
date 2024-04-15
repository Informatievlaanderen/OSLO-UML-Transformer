import type { Config } from '@jest/types';

// Or directly use inline config
const config: Config.InitialOptions = {
    runner: 'groups',
    transform: {
        "^.+\\.ts$": "ts-jest"
    },
    testRegex: '/test/.*.test.ts$',
    moduleFileExtensions: ['ts', 'js'],
    collectCoverage: true,
    coveragePathIgnorePatterns: ['/node_modules/', 'index.js'],
    testEnvironment: 'node',
    moduleNameMapper: {
        "^@oslo-core/(.*)$": "<rootDir>/packages/oslo-core/lib/$1",
        "^@oslo-converter-uml-ea/(.*)$": "<rootDir>/packages/oslo-converter-uml-ea/lib/$1",
        "^@oslo-generator-json-webuniversum/(.*)$": "<rootDir>/packages/oslo-generator-json-webuniversum/lib/$1",
        "^@oslo-generator-jsonld-context/(.*)$": "<rootDir>/packages/oslo-generator-jsonld-context/lib/$1",
        "^@oslo-generator-shacl-template/(.*)$": "<rootDir>/packages/oslo-generator-shacl-template/lib/$1",
        "^@oslo-generator-rdf-vocabulary/(.*)$": "<rootDir>/packages/oslo-generator-rdf-vocabulary/lib/$1",
        "^@oslo-extractor-uml-ea/(.*)$": "<rootDir>/packages/oslo-extractor-uml-ea/lib/$1"
    },
};

export default config;