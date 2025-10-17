import { Document } from '@/Document/Domain/Document'
import { DocumentId } from '@/Document/Domain/DocumentId'

export interface DocumentRepositoryInterface {
  getById(documentId: DocumentId): Promise<Document>
  save(document: Document): Promise<void>
}
