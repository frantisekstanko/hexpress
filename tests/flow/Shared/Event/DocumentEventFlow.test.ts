import { FlowTester } from '@Tests/_support/FlowTester'
import { MockEventListener } from '@Tests/_support/mocks/MockEventListener'
import { StatusCodes } from 'http-status-codes'
import { LoginService } from '@/Authentication/Application/LoginService'
import { DocumentWasCreated } from '@/Document/Domain/DocumentWasCreated'
import { DocumentWasDeleted } from '@/Document/Domain/DocumentWasDeleted'
import { FailedEventRepositoryInterface } from '@/Shared/Application/Event/FailedEventRepositoryInterface'
import { ListenerProviderInterface } from '@/Shared/Application/Event/ListenerProviderInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { EventLevel } from '@/Shared/Domain/Event/EventLevel'
import { EventType } from '@/Shared/Domain/Event/EventType'
import { UserId } from '@/Shared/Domain/UserId'

const TEST_USER_ID = '86582cca-4a8c-4591-835e-ff9f18c705ed'

describe('Document Event Flow Integration', () => {
  const tester = FlowTester.setup()
  let loginService: LoginService
  let listenerProvider: ListenerProviderInterface
  let failedEventRepository: FailedEventRepositoryInterface

  beforeEach(() => {
    loginService = tester.container.get<LoginService>(Symbols.LoginService)
    listenerProvider = tester.container.get<ListenerProviderInterface>(
      Symbols.ListenerProviderInterface,
    )
    failedEventRepository =
      tester.container.get<FailedEventRepositoryInterface>(
        Symbols.FailedEventRepositoryInterface,
      )
  })

  describe('document creation event flow', () => {
    it('should trigger DocumentWasCreated event when document is created', async () => {
      const createListener = new MockEventListener<DocumentWasCreated>()
      listenerProvider.addListener(DocumentWasCreated, createListener.listener)

      const { accessToken } = await loginService.generateTokenPair(
        UserId.fromString(TEST_USER_ID),
      )

      const response = await tester.request
        .post('/api/v1/document')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ documentName: 'Integration Test Document' })

      expect(response.status).toBe(StatusCodes.CREATED)
      expect(response.body).toHaveProperty('documentId')

      expect(createListener.listener).toHaveBeenCalled()
      const event = createListener.getLastEvent()!
      expect(event).toBeInstanceOf(DocumentWasCreated)
      expect(event.getDocumentName()).toBe('Integration Test Document')
      expect(event.getEventName()).toBe('DocumentWasCreated')
      expect(event.getLevel()).toBe(EventLevel.INFO)
      expect(event.getEventType()).toBe(EventType.MANUAL)
      expect(event.getLogMessage()).toContain('was created')
      expect(event.getLogContext()).toHaveProperty('documentId')
      expect(event.getLogContext()).toHaveProperty(
        'documentName',
        'Integration Test Document',
      )
      expect(event.getLogContext()).toHaveProperty('ownerId', TEST_USER_ID)
      expect(event.getDocumentId().toString()).toBe(response.body.documentId)
      expect(event.getOwnerId().toString()).toBe(TEST_USER_ID)

      const failedEvents = await failedEventRepository.getAll()
      expect(failedEvents).toHaveLength(0)
    })

    it('should execute multiple listeners for document creation', async () => {
      const listenerOne = new MockEventListener<DocumentWasCreated>()
      const listenerTwo = new MockEventListener<DocumentWasCreated>()
      listenerProvider.addListener(DocumentWasCreated, listenerOne.listener)
      listenerProvider.addListener(DocumentWasCreated, listenerTwo.listener)

      const { accessToken } = await loginService.generateTokenPair(
        UserId.fromString(TEST_USER_ID),
      )

      const response = await tester.request
        .post('/api/v1/document')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ documentName: 'Multi Listener Test' })

      expect(response.status).toBe(StatusCodes.CREATED)

      expect(listenerOne.listener).toHaveBeenCalled()
      expect(listenerTwo.listener).toHaveBeenCalled()

      const event = listenerOne.getLastEvent()!
      expect(event).toBeInstanceOf(DocumentWasCreated)
      expect(event.getDocumentName()).toBe('Multi Listener Test')
      expect(event.getOwnerId().toString()).toBe(TEST_USER_ID)
    })
  })

  describe('document deletion event flow', () => {
    it('should trigger DocumentWasDeleted event when document is deleted', async () => {
      const deleteListener = new MockEventListener<DocumentWasDeleted>()
      listenerProvider.addListener(DocumentWasDeleted, deleteListener.listener)

      const { accessToken } = await loginService.generateTokenPair(
        UserId.fromString(TEST_USER_ID),
      )

      const createResponse = await tester.request
        .post('/api/v1/document')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ documentName: 'Document To Delete' })

      expect(createResponse.status).toBe(StatusCodes.CREATED)
      const documentId = createResponse.body.documentId

      const deleteResponse = await tester.request
        .delete(`/api/v1/document/${documentId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(deleteResponse.status).toBe(StatusCodes.NO_CONTENT)

      expect(deleteListener.listener).toHaveBeenCalled()
      const event = deleteListener.getLastEvent()!
      expect(event).toBeInstanceOf(DocumentWasDeleted)
      expect(event.getDocumentId().toString()).toBe(documentId)
      expect(event.getEventName()).toBe('DocumentWasDeleted')
      expect(event.getLevel()).toBe(EventLevel.INFO)
      expect(event.getEventType()).toBe(EventType.MANUAL)
      expect(event.getLogMessage()).toContain('was deleted')
      expect(event.getLogContext()).toHaveProperty('documentId', documentId)

      const failedEvents = await failedEventRepository.getAll()
      expect(failedEvents).toHaveLength(0)
    })

    it('should execute multiple listeners for document deletion', async () => {
      const listenerOne = new MockEventListener<DocumentWasDeleted>()
      const listenerTwo = new MockEventListener<DocumentWasDeleted>()
      listenerProvider.addListener(DocumentWasDeleted, listenerOne.listener)
      listenerProvider.addListener(DocumentWasDeleted, listenerTwo.listener)

      const { accessToken } = await loginService.generateTokenPair(
        UserId.fromString(TEST_USER_ID),
      )

      const createResponse = await tester.request
        .post('/api/v1/document')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ documentName: 'Multi Delete Listener Test' })

      const documentId = createResponse.body.documentId

      const deleteResponse = await tester.request
        .delete(`/api/v1/document/${documentId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(deleteResponse.status).toBe(StatusCodes.NO_CONTENT)

      expect(listenerOne.listener).toHaveBeenCalled()
      expect(listenerTwo.listener).toHaveBeenCalled()

      const event = listenerOne.getLastEvent()!
      expect(event).toBeInstanceOf(DocumentWasDeleted)
      expect(event.getDocumentId().toString()).toBe(documentId)
    })
  })

  describe('listener failure in document flow', () => {
    it('should complete document creation even if custom listener fails', async () => {
      const failingListener = jest.fn(() => {
        throw new Error('Custom listener failure')
      })
      Object.defineProperty(failingListener, 'name', {
        value: 'failingCustomListener',
      })

      listenerProvider.addListener(DocumentWasCreated, failingListener)

      const { accessToken } = await loginService.generateTokenPair(
        UserId.fromString(TEST_USER_ID),
      )

      const response = await tester.request
        .post('/api/v1/document')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ documentName: 'Failing Listener Test' })

      expect(response.status).toBe(StatusCodes.CREATED)
      expect(response.body).toHaveProperty('documentId')

      const documents = await tester.database.query('SELECT * FROM documents')
      expect(documents).toHaveLength(1)
      expect(documents[0].documentName).toBe('Failing Listener Test')

      const failedEvents = await failedEventRepository.getAll()
      expect(failedEvents).toHaveLength(1)
      expect(failedEvents[0].getListenerName()).toBe('failingCustomListener')
    })

    it('should continue with other listeners when one fails during deletion', async () => {
      const successListener = jest.fn()
      const failingListener = jest.fn(() => {
        throw new Error('Deletion listener failure')
      })
      Object.defineProperty(failingListener, 'name', {
        value: 'failingDeleteListener',
      })

      listenerProvider.addListener(DocumentWasDeleted, failingListener)
      listenerProvider.addListener(DocumentWasDeleted, successListener)

      const { accessToken } = await loginService.generateTokenPair(
        UserId.fromString(TEST_USER_ID),
      )

      const createResponse = await tester.request
        .post('/api/v1/document')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ documentName: 'Multi Listener Delete Test' })

      const documentId = createResponse.body.documentId

      const deleteResponse = await tester.request
        .delete(`/api/v1/document/${documentId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(deleteResponse.status).toBe(StatusCodes.NO_CONTENT)

      expect(failingListener).toHaveBeenCalled()
      expect(successListener).toHaveBeenCalled()

      const failedEvents = await failedEventRepository.getAll()
      expect(failedEvents).toHaveLength(1)
      expect(failedEvents[0].getListenerName()).toBe('failingDeleteListener')
    })
  })

  describe('multiple document operations with events', () => {
    it('should trigger events for each document operation independently', async () => {
      const createListener = new MockEventListener<DocumentWasCreated>()
      const deleteListener = new MockEventListener<DocumentWasDeleted>()

      listenerProvider.addListener(DocumentWasCreated, createListener.listener)
      listenerProvider.addListener(DocumentWasDeleted, deleteListener.listener)

      const { accessToken } = await loginService.generateTokenPair(
        UserId.fromString(TEST_USER_ID),
      )

      const doc1 = await tester.request
        .post('/api/v1/document')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ documentName: 'Document One' })

      const doc2 = await tester.request
        .post('/api/v1/document')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ documentName: 'Document Two' })

      expect(createListener.getEventCount()).toBe(2)

      await tester.request
        .delete(`/api/v1/document/${doc1.body.documentId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(deleteListener.getEventCount()).toBe(1)
      expect(createListener.getEventCount()).toBe(2)

      await tester.request
        .delete(`/api/v1/document/${doc2.body.documentId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(deleteListener.getEventCount()).toBe(2)
      expect(createListener.getEventCount()).toBe(2)
    })
  })
})
