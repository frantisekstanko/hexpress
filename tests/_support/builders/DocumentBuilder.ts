import { UserId } from '@/Core/Domain/UserId'
import { Document } from '@/Document/Domain/Document'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentName } from '@/Document/Domain/DocumentName'

export class DocumentBuilder {
  public static create(params: {
    documentId: string
    name: string
    ownerId: string
  }): Document {
    const document = Document.create({
      id: DocumentId.fromString(params.documentId),
      name: DocumentName.fromString(params.name),
      owner: UserId.fromString(params.ownerId),
    })
    return document
  }
}
