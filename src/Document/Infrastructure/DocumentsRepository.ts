import { inject, injectable } from 'inversify'
import { DocumentsRepositoryInterface } from '@/Document/Application/DocumentsRepositoryInterface'
import { Document } from '@/Document/Application/ReadModel/Document'
import { DatabaseContextInterface } from '@/Shared/Application/Database/DatabaseContextInterface'
import { DatabaseRecordInterface } from '@/Shared/Application/Database/DatabaseRecordInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { Assertion } from '@/Shared/Domain/Assert/Assertion'
import { UserId } from '@/Shared/Domain/UserId'

@injectable()
export class DocumentsRepository implements DocumentsRepositoryInterface {
  readonly documentsTable = 'documents'

  constructor(
    @inject(Symbols.DatabaseContextInterface)
    private readonly databaseContext: DatabaseContextInterface,
  ) {}

  async getDocumentsByUserId(userId: UserId): Promise<Document[]> {
    const rows = await this.databaseContext.getCurrentDatabase().query(
      `SELECT documentId, documentName
       FROM ${this.documentsTable}
       WHERE ownedByUserId = ?
       ORDER BY id DESC
      `,
      [userId.toString()],
    )

    return rows.map((row: DatabaseRecordInterface) => {
      Assertion.string(row.documentId, 'documentId was expected to be a string')
      Assertion.string(
        row.documentName,
        'documentName was expected to be a string',
      )

      return new Document({
        id: row.documentId,
        name: row.documentName,
      })
    })
  }
}
