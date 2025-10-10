import { Document } from '@/Document/Application/ReadModel/Document'
import { UserId } from '@/Shared/Domain/UserId'

export interface DocumentsRepositoryInterface {
  getDocumentsByUserId(userId: UserId): Promise<Document[]>
}
