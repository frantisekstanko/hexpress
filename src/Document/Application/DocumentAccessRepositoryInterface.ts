import { DocumentId } from '@/Document/Domain/DocumentId'
import { UserId } from '@/Shared/Domain/UserId'

export interface DocumentAccessRepositoryInterface {
  canUserAccessDocument(
    userId: UserId,
    documentId: DocumentId,
  ): Promise<boolean>
}
