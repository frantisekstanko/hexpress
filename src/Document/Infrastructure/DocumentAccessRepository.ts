import { inject, injectable } from 'inversify'
import { DocumentAccessRepositoryInterface } from '@/Document/Application/DocumentAccessRepositoryInterface'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentNotFoundException } from '@/Document/Domain/DocumentNotFoundException'
import { DatabaseContextInterface } from '@/Shared/Application/Database/DatabaseContextInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { UserId } from '@/Shared/Domain/UserId'

@injectable()
export class DocumentAccessRepository
  implements DocumentAccessRepositoryInterface
{
  readonly documentsTable = 'documents'

  constructor(
    @inject(Symbols.DatabaseContextInterface)
    private readonly databaseContext: DatabaseContextInterface,
  ) {}

  async canUserAccessDocument(
    userId: UserId,
    documentId: DocumentId,
  ): Promise<boolean> {
    const row = await this.databaseContext.getCurrentDatabase().queryFirst(
      `SELECT ownedByUserId
       FROM ${this.documentsTable}
       WHERE documentId = ?`,
      [documentId.toString()],
    )

    if (row === null) {
      throw new DocumentNotFoundException(documentId)
    }

    if (row.ownedByUserId !== userId.toString()) {
      return false
    }

    return true
  }
}
