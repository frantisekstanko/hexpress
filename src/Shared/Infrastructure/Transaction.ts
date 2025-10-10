import mysql from 'mysql2/promise'
import { DatabaseRecordInterface } from '@/Shared/Application/Database/DatabaseRecordInterface'
import { DatabaseTransactionInterface } from '@/Shared/Application/Database/DatabaseTransactionInterface'

export class Transaction implements DatabaseTransactionInterface {
  private isFinalized = false

  constructor(private readonly connection: mysql.PoolConnection) {}

  public async query(
    sql: string,
    params?: unknown[],
  ): Promise<DatabaseRecordInterface[]> {
    this.ensureNotFinalized()
    const [rows] = await this.connection.execute(sql, params)
    return rows as DatabaseRecordInterface[]
  }

  public async queryFirst(
    sql: string,
    params?: unknown[],
  ): Promise<DatabaseRecordInterface | null> {
    const rows = await this.query(sql, params)
    return rows.length > 0 ? rows[0] : null
  }

  public async commit(): Promise<void> {
    this.ensureNotFinalized()
    try {
      await this.connection.commit()
    } finally {
      this.finalize()
    }
  }

  public async rollback(): Promise<void> {
    this.ensureNotFinalized()
    try {
      await this.connection.rollback()
    } finally {
      this.finalize()
    }
  }

  private ensureNotFinalized(): void {
    if (this.isFinalized) {
      throw new Error(
        'Transaction has already been committed or rolled back. Cannot perform further operations.',
      )
    }
  }

  private finalize(): void {
    this.isFinalized = true
    this.connection.release()
  }
}
