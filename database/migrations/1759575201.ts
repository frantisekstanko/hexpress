import { DatabaseInterface } from '@/Shared/Application/Database/DatabaseInterface'
import { MigrationInterface } from '@/Shared/Application/Database/MigrationInterface'

export default class Migration1759575201 implements MigrationInterface {
  constructor(private readonly database: DatabaseInterface) {}

  async up(): Promise<void> {
    await this.database.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
        documentId VARCHAR(36) NOT NULL,
        documentName VARCHAR(255) NOT NULL,
        ownedByUserId VARCHAR(36) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY documentId (documentId),
        KEY ownedByUserId (ownedByUserId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  }

  async down(): Promise<void> {
    await this.database.query('DROP TABLE IF EXISTS documents')
  }
}
