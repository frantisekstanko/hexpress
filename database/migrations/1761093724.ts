import { DatabaseInterface } from '@/Core/Application/Database/DatabaseInterface'
import { MigrationInterface } from '@/Core/Application/Database/MigrationInterface'

export default class Migration1761093724 implements MigrationInterface {
  constructor(private readonly database: DatabaseInterface) {}

  async up(): Promise<void> {
    await this.database.query(`
      CREATE TABLE event_outbox (
        id VARCHAR(36) PRIMARY KEY,
        event_name VARCHAR(255) NOT NULL,
        event_payload JSON NOT NULL,
        created_at INT NOT NULL,
        processed_at INT NULL,
        INDEX idx_processed_created (processed_at, created_at)
      ) ENGINE=InnoDB
    `)
  }

  async down(): Promise<void> {
    await this.database.query(`
      DROP TABLE event_outbox
    `)
  }
}
