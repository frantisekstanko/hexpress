import { CommandInterface } from '@/Core/Application/Command/CommandInterface'
import { DocumentId } from '@/Document/Domain/DocumentId'

export class DeleteDocument implements CommandInterface {
  private readonly documentId: DocumentId

  constructor(args: { documentId: DocumentId }) {
    this.documentId = args.documentId
  }

  public getDocumentId(): DocumentId {
    return this.documentId
  }
}
