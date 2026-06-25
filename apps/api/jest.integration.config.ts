import type { Config } from 'jest';

const config: Config = {
  displayName: 'api-integration',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleNameMapper: {
    '^@family-tree/shared$': '<rootDir>/../../libs/shared/src/index.ts',
    '^~/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testMatch: ['**/*.integration.spec.ts'],
  testTimeout: 60000,
  globalSetup: '<rootDir>/src/test/global-setup.ts',
  globalTeardown: '<rootDir>/src/test/global-teardown.ts',
  maxWorkers: 1,
};

export default config;
