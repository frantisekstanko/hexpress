import { DocumentId } from '@/Document/Domain/DocumentId'
import { ExceptionInterface } from '@/Shared/Domain/Exception/ExceptionInterface'

export class DocumentNotFoundException
  extends Error
  implements ExceptionInterface
{
  constructor(documentId: DocumentId) {
    super(`Document not found: ${documentId.toString()}`)
    this.name = this.constructor.name
  }
}
