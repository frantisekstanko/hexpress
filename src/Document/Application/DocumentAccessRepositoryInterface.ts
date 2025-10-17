import { UserId } from '@/Core/Domain/UserId'
import { DocumentId } from '@/Document/Domain/DocumentId'

export interface DocumentAccessRepositoryInterface {
  canUserAccessDocument(
    userId: UserId,
    documentId: DocumentId,
  ): Promise<boolean>
}
