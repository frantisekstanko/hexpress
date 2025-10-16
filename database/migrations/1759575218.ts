import { DatabaseInterface } from '@/Core/Application/Database/DatabaseInterface'
import { MigrationInterface } from '@/Core/Application/Database/MigrationInterface'

export default class Migration1759575218 implements MigrationInterface {
  constructor(private readonly database: DatabaseInterface) {}

  async up(): Promise<void> {
    await this.database.query(`
      CREATE TABLE refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(512) NOT NULL UNIQUE,
        userId VARCHAR(36) NOT NULL,
        created_at INT NOT NULL,
        expires_at INT NOT NULL,
        INDEX user_id (userId),
        INDEX expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  }

  async down(): Promise<void> {
    await this.database.query('DROP TABLE IF EXISTS refresh_tokens')
  }
}
