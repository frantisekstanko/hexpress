import path from 'node:path'
import dotenv from 'dotenv'
import { baseConfiguration } from './jest.config.js'

dotenv.config({
  path: path.join(process.cwd(), '.env.defaults'),
  quiet: true,
})

dotenv.config({
  path: path.join(process.cwd(), '.env.flow.tests'),
  override: true,
  quiet: true,
})

const configuration = {
  ...baseConfiguration,
  displayName: 'flow',
  roots: ['<rootDir>/tests/flow'],
  testMatch: ['**/*.test.ts'],
}

export default configuration
