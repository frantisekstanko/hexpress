import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { DatabaseRecordInterface } from '@/Core/Application/Database/DatabaseRecordInterface'
import { DatabaseRowMapper } from '@/Core/Infrastructure/DatabaseRowMapper'
import { Document } from '@/Document/Domain/Document'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentNotFoundException } from '@/Document/Domain/DocumentNotFoundException'
import { DocumentRepositoryInterface } from '@/Document/Domain/DocumentRepositoryInterface'
import { TableNames } from '@/Document/Infrastructure/TableNames'

export class DocumentRepository implements DocumentRepositoryInterface {
  constructor(private readonly databaseContext: DatabaseContextInterface) {}

  async getById(documentId: DocumentId): Promise<Document> {
    const rows = await this.databaseContext.getDatabase().query(
      `SELECT documentId, documentName, ownedByUserId
       FROM ${TableNames.DOCUMENTS}
       WHERE documentId = ?`,
      [documentId.toString()],
    )

    if (rows.length === 0) {
      throw new DocumentNotFoundException(documentId)
    }

    return this.mapRowToDocument(rows[0])
  }

  async save(document: Document): Promise<void> {
    if (document.isDeleted()) {
      await this.databaseContext
        .getDatabase()
        .query(`DELETE FROM ${TableNames.DOCUMENTS} WHERE documentId = ?`, [
          document.getId().toString(),
        ])
      return
    }

    await this.databaseContext.getDatabase().query(
      `INSERT INTO ${TableNames.DOCUMENTS} (
        documentId, documentName, ownedByUserId
      ) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
        documentName = values(documentName),
        ownedByUserId = values(ownedByUserId)`,
      [
        document.getId().toString(),
        document.getName().toString(),
        document.getOwner().toString(),
      ],
    )
  }

  private mapRowToDocument(row: DatabaseRecordInterface): Document {
    return Document.fromPersistence({
      documentId: DatabaseRowMapper.extractString(row, 'documentId'),
      documentName: DatabaseRowMapper.extractString(row, 'documentName'),
      ownedByUserId: DatabaseRowMapper.extractString(row, 'ownedByUserId'),
    })
  }
}
