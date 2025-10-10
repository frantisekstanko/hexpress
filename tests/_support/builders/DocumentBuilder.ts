import { Document } from '@/Document/Domain/Document'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { UserId } from '@/Shared/Domain/UserId'

export class DocumentBuilder {
  public static create(params: {
    documentId: string
    name: string
    ownerId: string
  }): Document {
    const document = Document.create({
      id: DocumentId.fromString(params.documentId),
      name: params.name,
      owner: UserId.fromString(params.ownerId),
    })
    return document
  }
}
