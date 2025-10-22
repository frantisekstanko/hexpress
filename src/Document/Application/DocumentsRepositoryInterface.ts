import { UserId } from '@/Core/Domain/UserId'
import { Document } from '@/Document/Application/ReadModel/Document'
import { DocumentId } from '@/Document/Domain/DocumentId'

export interface DocumentsRepositoryInterface {
  getDocumentsByUserId(userId: UserId): Promise<Document[]>
  canUserAccessDocument(
    userId: UserId,
    documentId: DocumentId,
  ): Promise<boolean>
}
