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
};

export default config;