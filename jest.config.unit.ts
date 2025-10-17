import type { Config } from 'jest'
import { baseConfiguration } from './jest.config'

const configuration: Config = {
  ...baseConfiguration,
  displayName: 'unit',
  roots: ['<rootDir>/tests/unit'],
  testMatch: ['**/*.test.ts'],
}

export default configuration
