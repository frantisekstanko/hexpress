import { inject, injectable } from 'inversify'
import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { Symbols } from '@/Core/Application/Symbols'
import { Document } from '@/Document/Domain/Document'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentNotFoundException } from '@/Document/Domain/DocumentNotFoundException'
import { DocumentRepositoryInterface } from '@/Document/Domain/DocumentRepositoryInterface'
import { TableNames } from '@/Document/Infrastructure/TableNames'

@injectable()
export class DocumentRepository implements DocumentRepositoryInterface {
  constructor(
    @inject(Symbols.DatabaseContextInterface)
    private readonly databaseContext: DatabaseContextInterface,
  ) {}

  async getById(documentId: DocumentId): Promise<Document> {
    const rows = await this.databaseContext.getCurrentDatabase().query(
      `SELECT documentId, documentName, ownedByUserId
       FROM ${TableNames.DOCUMENTS}
       WHERE documentId = ?`,
      [documentId.toString()],
    )

    if (rows.length === 0) {
      throw new DocumentNotFoundException(documentId)
    }

    return Document.fromStorage(rows[0])
  }

  async save(document: Document): Promise<void> {
    const documentData = document.toStorage()

    if (documentData.deleted) {
      await this.databaseContext
        .getCurrentDatabase()
        .query(`DELETE FROM ${TableNames.DOCUMENTS} WHERE documentId = ?`, [
          documentData.id,
        ])
      return
    }

    await this.databaseContext.getCurrentDatabase().query(
      `INSERT INTO ${TableNames.DOCUMENTS} (
        documentId, documentName, ownedByUserId
      ) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
        documentName = values(documentName),
        ownedByUserId = values(ownedByUserId)`,
      [documentData.id, documentData.name, documentData.owner],
    )
  }
}
