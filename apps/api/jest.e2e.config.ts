import type { Config } from 'jest';

const config: Config = {
  displayName: 'api-e2e',
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
  testMatch: ['**/*.e2e.spec.ts'],
  testTimeout: 60000,
  globalSetup: '<rootDir>/src/test/global-setup.e2e.ts',
  globalTeardown: '<rootDir>/src/test/global-teardown.e2e.ts',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup-after-env.ts'],
  maxWorkers: 1,
};

export default config;
