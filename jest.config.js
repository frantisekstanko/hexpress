import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentFilename = fileURLToPath(import.meta.url)
const currentDirectory = dirname(currentFilename)

export const baseConfiguration = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: currentDirectory,
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

const configuration = {
  ...baseConfiguration,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/server.ts'],
  coverageDirectory: 'tests/_coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  projects: ['<rootDir>/jest.config.*.js'],
}

export default configuration
