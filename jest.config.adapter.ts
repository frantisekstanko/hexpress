import path from 'node:path'
import dotenv from 'dotenv'
import type { Config } from 'jest'
import { baseConfiguration } from './jest.config'

dotenv.config({
  path: path.join(process.cwd(), '.env.defaults'),
  quiet: true,
})

dotenv.config({
  path: path.join(process.cwd(), '.env.adapter.tests'),
  override: true,
  quiet: true,
})

const configuration: Config = {
  ...baseConfiguration,
  displayName: 'adapter',
  roots: ['<rootDir>/tests/adapter'],
  testMatch: ['**/*.test.ts'],
}

export default configuration
