import { UserId } from '@/Core/Domain/UserId'
import { Document } from '@/Document/Application/ReadModel/Document'

export interface DocumentsRepositoryInterface {
  getDocumentsByUserId(userId: UserId): Promise<Document[]>
}
