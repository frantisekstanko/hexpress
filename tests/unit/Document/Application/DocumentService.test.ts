import { DocumentBuilder } from '@Tests/_support/builders/DocumentBuilder'
import { MockUuidRepository } from '@Tests/_support/mocks/MockUuidRepository'
import { EventDispatcherInterface } from '@/Core/Application/Event/EventDispatcherInterface'
import { UserId } from '@/Core/Domain/UserId'
import { CreateDocument } from '@/Document/Application/CreateDocument'
import { DocumentService } from '@/Document/Application/DocumentService'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentRepositoryInterface } from '@/Document/Domain/DocumentRepositoryInterface'
import { DocumentWasCreated } from '@/Document/Domain/DocumentWasCreated'
import { DocumentWasDeleted } from '@/Document/Domain/DocumentWasDeleted'

const USER_ID = '93906a9e-250e-4151-b2e7-4f0ffcb3e11f'
const DOCUMENT_ID = 'e4926347-80ca-44ed-92fe-70c8f112c537'
const DOCUMENT_NAME = 'Omzetbelasting 2025 voorbereiden'

describe('DocumentService', () => {
  let documentService: DocumentService
  let uuidRepository: MockUuidRepository
  let documentRepository: jest.Mocked<DocumentRepositoryInterface>
  let eventDispatcher: jest.Mocked<EventDispatcherInterface>

  beforeEach(() => {
    uuidRepository = new MockUuidRepository()

    documentRepository = {
      save: jest.fn(),
      getById: jest.fn(),
      getByOwnerId: jest.fn(),
    } as unknown as jest.Mocked<DocumentRepositoryInterface>

    eventDispatcher = {
      dispatch: jest.fn(),
    } as jest.Mocked<EventDispatcherInterface>

    documentService = new DocumentService(
      uuidRepository,
      documentRepository,
      eventDispatcher,
    )
  })

  describe('createDocument', () => {
    it('should create document with generated UUID', async () => {
      uuidRepository.nextUuid(DOCUMENT_ID)

      const command = new CreateDocument({
        documentName: DOCUMENT_NAME,
        owner: UserId.fromString(USER_ID),
      })

      const documentId = await documentService.createDocument(command)

      expect(documentId.toString()).toBe(DOCUMENT_ID)
      expect(documentRepository.save).toHaveBeenCalledTimes(1)
    })

    it('should save document with correct properties', async () => {
      uuidRepository.nextUuid(DOCUMENT_ID)

      const command = new CreateDocument({
        documentName: DOCUMENT_NAME,
        owner: UserId.fromString(USER_ID),
      })

      await documentService.createDocument(command)

      const expectedDocument = DocumentBuilder.create({
        documentId: DOCUMENT_ID,
        name: DOCUMENT_NAME,
        ownerId: USER_ID,
      })

      expectedDocument.releaseEvents()

      expect(documentRepository.save).toHaveBeenCalledWith(expectedDocument)
    })

    it('should dispatch DocumentWasCreated event', async () => {
      uuidRepository.nextUuid(DOCUMENT_ID)

      const command = new CreateDocument({
        documentName: DOCUMENT_NAME,
        owner: UserId.fromString(USER_ID),
      })

      await documentService.createDocument(command)

      const event = new DocumentWasCreated({
        documentId: DocumentId.fromString(DOCUMENT_ID),
        documentName: DOCUMENT_NAME,
        ownerId: UserId.fromString(USER_ID),
      })

      expect(eventDispatcher.dispatch).toHaveBeenCalledWith(event)
    })
  })

  describe('deleteDocument', () => {
    it('should delete document and dispatch DocumentWasDeleted event', async () => {
      const document = DocumentBuilder.create({
        documentId: DOCUMENT_ID,
        name: DOCUMENT_NAME,
        ownerId: USER_ID,
      })

      documentRepository.getById.mockResolvedValue(document)

      const documentId = DocumentId.fromString(DOCUMENT_ID)

      await documentService.deleteDocument(documentId)

      const expectedDocument = DocumentBuilder.create({
        documentId: DOCUMENT_ID,
        name: DOCUMENT_NAME,
        ownerId: USER_ID,
      })

      expectedDocument.delete()
      expectedDocument.releaseEvents()

      expect(documentRepository.getById).toHaveBeenCalledWith(documentId)
      expect(documentRepository.save).toHaveBeenCalledWith(expectedDocument)

      const event = new DocumentWasDeleted({
        documentId: DocumentId.fromString(DOCUMENT_ID),
        ownerId: UserId.fromString(USER_ID),
      })

      expect(eventDispatcher.dispatch).toHaveBeenCalledWith(event)
    })
  })
})
