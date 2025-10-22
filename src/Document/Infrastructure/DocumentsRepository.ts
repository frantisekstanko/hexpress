import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { DatabaseRecordInterface } from '@/Core/Application/Database/DatabaseRecordInterface'
import { UserId } from '@/Core/Domain/UserId'
import { DatabaseRowMapper } from '@/Core/Infrastructure/DatabaseRowMapper'
import { DocumentsRepositoryInterface } from '@/Document/Application/DocumentsRepositoryInterface'
import { Document } from '@/Document/Application/ReadModel/Document'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentNotFoundException } from '@/Document/Domain/DocumentNotFoundException'
import { TableNames } from '@/Document/Infrastructure/TableNames'

export class DocumentsRepository implements DocumentsRepositoryInterface {
  constructor(private readonly databaseContext: DatabaseContextInterface) {}

  async getDocumentsByUserId(userId: UserId): Promise<Document[]> {
    const rows = await this.databaseContext.getCurrentDatabase().query(
      `SELECT documentId, documentName
       FROM ${TableNames.DOCUMENTS}
       WHERE ownedByUserId = ?
       ORDER BY id DESC
      `,
      [userId.toString()],
    )

    return rows.map((row: DatabaseRecordInterface) => {
      return new Document({
        id: DatabaseRowMapper.extractString(row, 'documentId'),
        name: DatabaseRowMapper.extractString(row, 'documentName'),
      })
    })
  }

  async canUserAccessDocument(
    userId: UserId,
    documentId: DocumentId,
  ): Promise<boolean> {
    const row = await this.databaseContext.getCurrentDatabase().query(
      `SELECT ownedByUserId
       FROM ${TableNames.DOCUMENTS}
       WHERE documentId = ?`,
      [documentId.toString()],
    )

    if (row.length === 0) {
      throw new DocumentNotFoundException(documentId)
    }

    if (row[0].ownedByUserId !== userId.toString()) {
      return false
    }

    return true
  }
}
