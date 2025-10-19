import path from 'node:path'
import dotenv from 'dotenv'
import { DatabaseConnectionInterface } from '@/Core/Application/Database/DatabaseConnectionInterface'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { Services } from '@/Core/Application/Services'
import { ContainerFactory } from '@/Core/Infrastructure/ContainerFactory'
import { MigrationRunner } from '@/Core/Infrastructure/MigrationRunner'

dotenv.config({ path: path.join(process.cwd(), '.env.defaults') })
dotenv.config({ path: path.join(process.cwd(), '.env.local'), override: true })

async function runMigrations() {
  const container = ContainerFactory.create()
  const database = container.get<DatabaseConnectionInterface>(
    Services.DatabaseConnectionInterface,
  )
  const logger = container.get<LoggerInterface>(Services.LoggerInterface)

  const migrationsPath = path.join(process.cwd(), 'database/migrations')
  const runner = new MigrationRunner({ database, logger, migrationsPath })

  try {
    await runner.run()
    logger.info('Migrations completed successfully')
    process.exit(0)
  } catch (error) {
    logger.error('Migration failed', error)
    process.exit(1)
  }
}

runMigrations().catch((error: unknown) => {
  console.error('Unexpected error during migration')
  console.error(error)
  process.exit(1)
})
