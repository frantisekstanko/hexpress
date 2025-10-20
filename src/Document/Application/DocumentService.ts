import { EventDispatcherInterface } from '@/Core/Application/Event/EventDispatcherInterface'
import { UuidRepositoryInterface } from '@/Core/Application/UuidRepositoryInterface'
import { CreateDocument } from '@/Document/Application/CreateDocument'
import { Document } from '@/Document/Domain/Document'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentRepositoryInterface } from '@/Document/Domain/DocumentRepositoryInterface'

export class DocumentService {
  constructor(
    private readonly uuidRepository: UuidRepositoryInterface,
    private readonly documentRepository: DocumentRepositoryInterface,
    private readonly eventDispatcher: EventDispatcherInterface,
  ) {}

  public async createDocument(
    createDocument: CreateDocument,
  ): Promise<DocumentId> {
    const newDocumentId = new DocumentId(this.uuidRepository.getUuid())

    const newDocument = Document.create({
      id: newDocumentId,
      name: createDocument.getDocumentName(),
      owner: createDocument.getOwner(),
    })

    await this.saveDocument(newDocument)

    return newDocumentId
  }

  public async deleteDocument(documentId: DocumentId): Promise<void> {
    const document = await this.documentRepository.getById(documentId)

    document.delete()

    await this.saveDocument(document)
  }

  private async saveDocument(document: Document): Promise<void> {
    await this.documentRepository.save(document)

    for (const event of document.releaseEvents()) {
      await this.eventDispatcher.dispatch(event)
    }
  }
}
