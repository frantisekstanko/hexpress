import path from 'node:path'
import mysql from 'mysql2/promise'
import { ConfigInterface } from '@/Shared/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Shared/Application/Config/ConfigOption'
import { DatabaseInterface } from '@/Shared/Application/Database/DatabaseInterface'
import { LoggerInterface } from '@/Shared/Application/LoggerInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { ContainerFactory } from '@/Shared/Infrastructure/ContainerFactory'
import { MigrationRunner } from '@/Shared/Infrastructure/MigrationRunner'

export class TestDatabase {
  constructor(private readonly config: ConfigInterface) {}

  public async create(): Promise<void> {
    await this.createDatabase()
    await this.runMigrations()
  }

  public async drop(): Promise<void> {
    const connection = await this.connect()
    await connection.query(
      `DROP DATABASE IF EXISTS ${this.config.get(ConfigOption.DB_NAME)}`,
    )
    await connection.end()
  }

  private async createDatabase(): Promise<void> {
    const connection = await this.connect()
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${this.config.get(ConfigOption.DB_NAME)}`,
    )
    await connection.end()
  }

  private async runMigrations(): Promise<void> {
    const container = ContainerFactory.create()
    const database = container.get<DatabaseInterface>(
      Symbols.DatabaseConnectionInterface,
    )
    const logger = container.get<LoggerInterface>(Symbols.LoggerInterface)
    const migrationsPath = path.join(process.cwd(), 'database/migrations')

    const runner = new MigrationRunner({ database, logger, migrationsPath })
    await runner.run()
    await container.shutdown()
  }

  private async connect(): Promise<mysql.Connection> {
    return await mysql.createConnection({
      host: this.config.get(ConfigOption.DB_HOST),
      port: Number(this.config.get(ConfigOption.DB_PORT)),
      user: this.config.get(ConfigOption.DB_USER),
      password: this.config.get(ConfigOption.DB_PASSWORD),
    })
  }
}
