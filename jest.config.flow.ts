import path from 'node:path'
import dotenv from 'dotenv'
import type { Config } from 'jest'
import { baseConfiguration } from './jest.config'

dotenv.config({
  path: path.join(process.cwd(), '.env.defaults'),
  quiet: true,
})

dotenv.config({
  path: path.join(process.cwd(), '.env.flow.tests'),
  override: true,
  quiet: true,
})

const configuration: Config = {
  ...baseConfiguration,
  displayName: 'flow',
  roots: ['<rootDir>/tests/flow'],
  testMatch: ['**/*.test.ts'],
}

export default configuration
