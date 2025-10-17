import path from 'node:path'
import dotenv from 'dotenv'
import { baseConfiguration } from './jest.config.js'

dotenv.config({
  path: path.join(process.cwd(), '.env.defaults'),
  quiet: true,
})

dotenv.config({
  path: path.join(process.cwd(), '.env.adapter.tests'),
  override: true,
  quiet: true,
})

const configuration = {
  ...baseConfiguration,
  displayName: 'adapter',
  roots: ['<rootDir>/tests/adapter'],
  testMatch: ['**/*.test.ts'],
}

export default configuration
