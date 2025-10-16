import { DocumentId } from '@/Document/Domain/DocumentId'
import { CommandInterface } from '@/Shared/Application/Command/CommandInterface'

export class DeleteDocument implements CommandInterface {
  private readonly documentId: DocumentId

  constructor(args: { documentId: DocumentId }) {
    this.documentId = args.documentId
  }

  getDocumentId(): DocumentId {
    return this.documentId
  }
}
