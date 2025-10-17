import { baseConfiguration } from './jest.config.js'

const configuration = {
  ...baseConfiguration,
  displayName: 'unit',
  roots: ['<rootDir>/tests/unit'],
  testMatch: ['**/*.test.ts'],
}

export default configuration
