import type { Config } from '@jest/types';
import path from 'path';

const config: Config.InitialOptions = {
  runner: 'groups',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  // Mock data needed to mock the rdf libraries in Jest.
  // Issue between module and ESM of the library and the used packages
  moduleNameMapper: {
    '^@rdfjs/serializer-turtle$':
      '<rootDir>/oslo-generator-shacl-template/test/__mocks__/@rdfjs/serializer-turtle.js',
    '^@rdfjs/sink$':
      '<rootDir>//oslo-generator-shacl-template/__mocks__/@rdfjs/sink.js',
  },
  testRegex: '/test/.*.test.ts$',
  moduleFileExtensions: ['ts', 'js'],
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', 'index.js'],
  testEnvironment: 'node',
};

export default config;
