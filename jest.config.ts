import type { Config } from 'jest'

export const baseConfiguration: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: __dirname,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@Tests/(.*)$': '<rootDir>/tests/$1',
  },
  testTimeout: 10000,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
    '^.+\\.m?js$': ['ts-jest', { useESM: true }],
  },
  transformIgnorePatterns: ['node_modules/(?!uuid)'],
}

const configuration: Config = {
  ...baseConfiguration,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/server.ts'],
  coverageDirectory: 'tests/_coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  projects: ['<rootDir>/jest.config.*.ts'],
}

export default configuration
