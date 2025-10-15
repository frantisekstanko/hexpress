import { inject, injectable } from 'inversify'
import { Document } from '@/Document/Domain/Document'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentNotFoundException } from '@/Document/Domain/DocumentNotFoundException'
import { DocumentRepositoryInterface } from '@/Document/Domain/DocumentRepositoryInterface'
import { DatabaseContextInterface } from '@/Shared/Application/Database/DatabaseContextInterface'
import { Symbols } from '@/Shared/Application/Symbols'

@injectable()
export class DocumentRepository implements DocumentRepositoryInterface {
  readonly documentsTable = 'documents'

  constructor(
    @inject(Symbols.DatabaseContextInterface)
    private readonly databaseContext: DatabaseContextInterface,
  ) {}

  async getById(documentId: DocumentId): Promise<Document> {
    const row = await this.databaseContext.getCurrentDatabase().queryFirst(
      `SELECT documentId, documentName, ownedByUserId
       FROM ${this.documentsTable}
       WHERE documentId = ?`,
      [documentId.toString()],
    )

    if (row === null) {
      throw new DocumentNotFoundException(documentId)
    }

    return Document.fromStorage(row)
  }

  async save(document: Document): Promise<void> {
    const documentData = document.toStorage()

    if (documentData.deleted) {
      await this.databaseContext
        .getCurrentDatabase()
        .query(`DELETE FROM ${this.documentsTable} WHERE documentId = ?`, [
          documentData.id,
        ])
      return
    }

    await this.databaseContext.getCurrentDatabase().query(
      `INSERT INTO ${this.documentsTable} (
        documentId, documentName, ownedByUserId
      ) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
        documentName = values(documentName),
        ownedByUserId = values(ownedByUserId)`,
      [documentData.id, documentData.name, documentData.owner],
    )
  }

  async delete(documentId: DocumentId): Promise<void> {
    await this.databaseContext
      .getCurrentDatabase()
      .query(`DELETE FROM ${this.documentsTable} WHERE documentId = ?`, [
        documentId.toString(),
      ])
  }
}
