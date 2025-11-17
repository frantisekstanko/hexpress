import fs from 'node:fs/promises'
import path from 'node:path'
import { DatabaseInterface } from '@/Core/Application/Database/DatabaseInterface'
import { MigrationInterface } from '@/Core/Application/Database/MigrationInterface'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'

export class MigrationRunner {
  private readonly database: DatabaseInterface
  private readonly logger: LoggerInterface
  private readonly migrationsPath: string
  private readonly migrationsTableName: string

  constructor(args: {
    database: DatabaseInterface
    logger: LoggerInterface
    migrationsPath: string
    migrationsTableName: string
  }) {
    this.database = args.database
    this.logger = args.logger
    this.migrationsPath = args.migrationsPath
    this.migrationsTableName = args.migrationsTableName
  }

  async run(): Promise<void> {
    await this.ensureMigrationsTable()

    const appliedMigrations = await this.getAppliedMigrations()
    const migrationFiles = await this.getMigrationFiles()

    const pendingMigrations = migrationFiles.filter(
      (file) => !appliedMigrations.includes(file),
    )

    if (pendingMigrations.length === 0) {
      this.logger.info('No pending migrations')
      return
    }

    this.logger.info(
      `Found ${String(pendingMigrations.length)} pending migrations`,
    )

    for (const migrationFile of pendingMigrations) {
      await this.runMigration(migrationFile)
    }

    this.logger.info('All migrations completed')
  }

  private async ensureMigrationsTable(): Promise<void> {
    try {
      await this.database.query(`
      CREATE TABLE IF NOT EXISTS ${this.migrationsTableName} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    } catch (error: unknown) {
      console.error('Error ensuring migrations table exists')
      throw error
    }
  }

  private async getAppliedMigrations(): Promise<string[]> {
    const rows = await this.database.query(
      `SELECT migration FROM ${this.migrationsTableName} ORDER BY migration`,
    )
    return rows.map((row) => String(row.migration))
  }

  private async getMigrationFiles(): Promise<string[]> {
    const files = await fs.readdir(this.migrationsPath)
    return files.filter((file) => file.endsWith('.ts')).sort()
  }

  private async runMigration(migrationFile: string): Promise<void> {
    this.logger.info(`Applying migration: ${migrationFile}`)

    const filePath = path.join(this.migrationsPath, migrationFile)

    const migrationModule = (await import(filePath)) as {
      default: new (database: DatabaseInterface) => MigrationInterface
    }
    const MigrationClass = migrationModule.default

    const migration: MigrationInterface = new MigrationClass(this.database)
    await migration.up()

    await this.database.query(
      `INSERT INTO ${this.migrationsTableName} (migration) VALUES (?)`,
      [migrationFile],
    )

    this.logger.info(`Migration applied: ${migrationFile}`)
  }
}
