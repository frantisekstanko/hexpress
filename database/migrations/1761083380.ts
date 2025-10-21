import { DatabaseInterface } from '@/Core/Application/Database/DatabaseInterface'
import { MigrationInterface } from '@/Core/Application/Database/MigrationInterface'

export default class Migration1761083380 implements MigrationInterface {
  constructor(private readonly database: DatabaseInterface) {}

  async up(): Promise<void> {
    await this.database.query(`
      ALTER TABLE refresh_tokens
      DROP COLUMN token,
      ADD COLUMN jti VARCHAR(36) NOT NULL UNIQUE AFTER id
    `)
  }

  async down(): Promise<void> {
    await this.database.query(`
      ALTER TABLE refresh_tokens
      DROP COLUMN jti,
      ADD COLUMN token VARCHAR(512) NOT NULL UNIQUE AFTER id
    `)
  }
}
