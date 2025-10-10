import path from 'node:path'
import dotenv from 'dotenv'
import { DatabaseConnectionInterface } from '@/Shared/Application/Database/DatabaseConnectionInterface'
import { LoggerInterface } from '@/Shared/Application/LoggerInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { ContainerFactory } from '@/Shared/Infrastructure/ContainerFactory'
import { MigrationRunner } from '@/Shared/Infrastructure/MigrationRunner'

dotenv.config({ path: path.join(process.cwd(), '.env.defaults') })
dotenv.config({ path: path.join(process.cwd(), '.env.local'), override: true })

async function runMigrations() {
  const container = ContainerFactory.create()
  const database = container.get<DatabaseConnectionInterface>(
    Symbols.DatabaseConnectionInterface,
  )
  const logger = container.get<LoggerInterface>(Symbols.LoggerInterface)

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
