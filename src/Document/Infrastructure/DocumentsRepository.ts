import { inject, injectable } from 'inversify'
import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { DatabaseRecordInterface } from '@/Core/Application/Database/DatabaseRecordInterface'
import { Symbols } from '@/Core/Application/Symbols'
import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { UserId } from '@/Core/Domain/UserId'
import { DocumentsRepositoryInterface } from '@/Document/Application/DocumentsRepositoryInterface'
import { Document } from '@/Document/Application/ReadModel/Document'
import { TableNames } from '@/Document/Infrastructure/TableNames'

@injectable()
export class DocumentsRepository implements DocumentsRepositoryInterface {
  constructor(
    @inject(Symbols.DatabaseContextInterface)
    private readonly databaseContext: DatabaseContextInterface,
  ) {}

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
