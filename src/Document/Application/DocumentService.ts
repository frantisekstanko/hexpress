import { inject, injectable } from 'inversify'
import { EventDispatcherInterface } from '@/Core/Application/Event/EventDispatcherInterface'
import { Symbols as CoreSymbols } from '@/Core/Application/Symbols'
import { UuidRepositoryInterface } from '@/Core/Application/UuidRepositoryInterface'
import { CreateDocument } from '@/Document/Application/CreateDocument'
import { Symbols as DocumentSymbols } from '@/Document/Application/Symbols'
import { Document } from '@/Document/Domain/Document'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentRepositoryInterface } from '@/Document/Domain/DocumentRepositoryInterface'

@injectable()
export class DocumentService {
  constructor(
    @inject(CoreSymbols.UuidRepositoryInterface)
    private readonly uuidRepository: UuidRepositoryInterface,
    @inject(DocumentSymbols.DocumentRepositoryInterface)
    private readonly documentRepository: DocumentRepositoryInterface,
    @inject(CoreSymbols.EventDispatcherInterface)
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

    await this.documentRepository.save(newDocument)

    for (const event of newDocument.releaseEvents()) {
      await this.eventDispatcher.dispatch(event)
    }

    return newDocumentId
  }

  public async deleteDocument(documentId: DocumentId): Promise<void> {
    const document = await this.documentRepository.getById(documentId)

    document.delete()

    await this.documentRepository.save(document)

    for (const event of document.releaseEvents()) {
      await this.eventDispatcher.dispatch(event)
    }
  }
}
