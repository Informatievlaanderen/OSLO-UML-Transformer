import type { Config } from '@jest/types';
import path from 'path';

const config: Config.InitialOptions = {
  runner: 'groups',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@rdfjs/serializer-turtle$':
      '<rootDir>/packages/oslo-generator-shacl-template/test/__mocks__/@rdfjs/serializer-turtle.js',
    '^@rdfjs/sink$':
      '<rootDir>/packages/oslo-generator-shacl-template/test/__mocks__/@rdfjs/sink.js',
  },
  testRegex: '/test/.*.test.ts$',
  moduleFileExtensions: ['ts', 'js'],
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', 'index.js'],
  testEnvironment: 'node',
};

export default config;
