import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { DatabaseRecordInterface } from '@/Core/Application/Database/DatabaseRecordInterface'
import { UserId } from '@/Core/Domain/UserId'
import { DatabaseRowMapper } from '@/Core/Infrastructure/DatabaseRowMapper'
import { DocumentsRepositoryInterface } from '@/Document/Application/DocumentsRepositoryInterface'
import { Document } from '@/Document/Application/ReadModel/Document'
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
}
