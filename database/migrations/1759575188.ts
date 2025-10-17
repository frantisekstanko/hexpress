import { DatabaseInterface } from '@/Core/Application/Database/DatabaseInterface'
import { MigrationInterface } from '@/Core/Application/Database/MigrationInterface'

export default class Migration1759575188 implements MigrationInterface {
  constructor(private readonly database: DatabaseInterface) {}

  async up(): Promise<void> {
    await this.database.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
        userId VARCHAR(36) NOT NULL,
        username VARCHAR(64) NOT NULL,
        password VARCHAR(128) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY userId (userId),
        UNIQUE KEY username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  }

  async down(): Promise<void> {
    await this.database.query('DROP TABLE IF EXISTS users')
  }
}
