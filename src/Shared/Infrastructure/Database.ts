import { inject, injectable } from 'inversify'
import mysql from 'mysql2/promise'
import { ConfigInterface } from '@/Shared/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Shared/Application/Config/ConfigOption'
import { DatabaseConnectionInterface } from '@/Shared/Application/Database/DatabaseConnectionInterface'
import { DatabaseRecordInterface } from '@/Shared/Application/Database/DatabaseRecordInterface'
import { DatabaseTransactionInterface } from '@/Shared/Application/Database/DatabaseTransactionInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { Transaction } from '@/Shared/Infrastructure/Transaction'

@injectable()
export class Database implements DatabaseConnectionInterface {
  private pool: mysql.Pool

  constructor(
    @inject(Symbols.ConfigInterface) private readonly config: ConfigInterface,
  ) {
    this.pool = mysql.createPool({
      host: this.config.get(ConfigOption.DB_HOST),
      port: Number(this.config.get(ConfigOption.DB_PORT)),
      user: this.config.get(ConfigOption.DB_USER),
      password: this.config.get(ConfigOption.DB_PASSWORD),
      database: this.config.get(ConfigOption.DB_NAME),
      charset: 'utf8mb4',
      connectionLimit: 100,
    })
  }

  public async query(
    sql: string,
    params?: unknown[],
  ): Promise<DatabaseRecordInterface[]> {
    const [rows] = await this.pool.execute(sql, params)
    return rows as DatabaseRecordInterface[]
  }

  public async createTransaction(): Promise<DatabaseTransactionInterface> {
    const connection = await this.pool.getConnection()
    await connection.beginTransaction()
    return new Transaction(connection)
  }

  public async close(): Promise<void> {
    await this.pool.end()
  }
}
