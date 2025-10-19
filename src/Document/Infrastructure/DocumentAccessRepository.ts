import { inject, injectable } from 'inversify'
import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { Services } from '@/Core/Application/Services'
import { UserId } from '@/Core/Domain/UserId'
import { DocumentAccessRepositoryInterface } from '@/Document/Application/DocumentAccessRepositoryInterface'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentNotFoundException } from '@/Document/Domain/DocumentNotFoundException'
import { TableNames } from '@/Document/Infrastructure/TableNames'

@injectable()
export class DocumentAccessRepository
  implements DocumentAccessRepositoryInterface
{
  constructor(
    @inject(Services.DatabaseContextInterface)
    private readonly databaseContext: DatabaseContextInterface,
  ) {}

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
