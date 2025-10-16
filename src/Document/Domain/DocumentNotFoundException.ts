import { ExceptionInterface } from '@/Core/Domain/Exception/ExceptionInterface'
import { DocumentId } from '@/Document/Domain/DocumentId'

export class DocumentNotFoundException
  extends Error
  implements ExceptionInterface
{
  constructor(documentId: DocumentId) {
    super(`Document not found: ${documentId.toString()}`)
    this.name = this.constructor.name
  }
}
