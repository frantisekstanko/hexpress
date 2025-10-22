import { UserId } from "@/Core/Domain/UserId"
import { TokenService } from "@/User/Application/TokenService"
import { FlowTester } from "@Tests/_support/FlowTester"
import { StatusCodes } from "http-status-codes"

const TEST_USER_ID = '86582cca-4a8c-4591-835e-ff9f18c705ed'

describe('Document Event Flow Integration', () => {
  const tester = FlowTester.setup()
  let loginService: TokenService

  beforeEach(() => {
    loginService = tester.container.get(TokenService)
  })

  describe('document creation event flow', () => {
    it('should save DocumentWasCreated event to outbox when document is created', async () => {
      const { accessToken } = await loginService.generateTokenPair(
        UserId.fromString(TEST_USER_ID),
      )

      const response = await tester.request
        .post('/api/v1/document')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ documentName: 'Integration Test Document' })

      expect(response.status).toBe(StatusCodes.CREATED)
      expect(response.body).toHaveProperty('documentId')

      const outboxEvents = await tester.database.query(
        'SELECT * FROM event_outbox WHERE processed_at IS NULL',
      )

      expect(outboxEvents).toHaveLength(1)
      expect(outboxEvents[0].event_name).toBe('DocumentWasCreated')

      const eventPayload = JSON.parse(outboxEvents[0].event_payload as string)
      expect(eventPayload.documentName).toBe('Integration Test Document')
      expect(eventPayload.ownerId.id.value).toBe(TEST_USER_ID)
      expect(eventPayload.documentId.id.value).toBe(response.body.documentId)
    })

    it('should save event to outbox for each document creation', async () => {
      const { accessToken } = await loginService.generateTokenPair(
        UserId.fromString(TEST_USER_ID),
      )

      await tester.request
        .post('/api/v1/document')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ documentName: 'Document One' })

      await tester.request
        .post('/api/v1/document')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ documentName: 'Document Two' })

      const outboxEvents = await tester.database.query(
        'SELECT * FROM event_outbox WHERE processed_at IS NULL AND event_name = ?',
        ['DocumentWasCreated'],
      )

      expect(outboxEvents.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('document deletion event flow', () => {
    it('should save DocumentWasDeleted event to outbox when document is deleted', async () => {
      const { accessToken } = await loginService.generateTokenPair(
        UserId.fromString(TEST_USER_ID),
      )

      const createResponse = await tester.request
        .post('/api/v1/document')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ documentName: 'Document To Delete' })

      expect(createResponse.status).toBe(StatusCodes.CREATED)
      const documentId = createResponse.body.documentId

      await tester.database.query('DELETE FROM event_outbox')

      const deleteResponse = await tester.request
        .delete(`/api/v1/document/${documentId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(deleteResponse.status).toBe(StatusCodes.NO_CONTENT)

      const outboxEvents = await tester.database.query(
        'SELECT * FROM event_outbox WHERE processed_at IS NULL AND event_name = ?',
        ['DocumentWasDeleted'],
      )

      expect(outboxEvents).toHaveLength(1)

      const eventPayload = JSON.parse(outboxEvents[0].event_payload as string)
      expect(eventPayload.documentId.id.value).toBe(documentId)
      expect(eventPayload.ownerId.id.value).toBe(TEST_USER_ID)
    })

    it('should save events to outbox for multiple deletions', async () => {
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

      await tester.database.query('DELETE FROM event_outbox')

      await tester.request
        .delete(`/api/v1/document/${doc1.body.documentId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      await tester.request
        .delete(`/api/v1/document/${doc2.body.documentId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      const outboxEvents = await tester.database.query(
        'SELECT * FROM event_outbox WHERE processed_at IS NULL AND event_name = ?',
        ['DocumentWasDeleted'],
      )

      expect(outboxEvents).toHaveLength(2)
    })
  })

  describe('transactional consistency', () => {
    it('should save document and event atomically', async () => {
      const { accessToken } = await loginService.generateTokenPair(
        UserId.fromString(TEST_USER_ID),
      )

      const response = await tester.request
        .post('/api/v1/document')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ documentName: 'Atomic Test Document' })

      expect(response.status).toBe(StatusCodes.CREATED)

      const documents = await tester.database.query(
        'SELECT * FROM documents WHERE documentId = ?',
        [response.body.documentId],
      )
      expect(documents).toHaveLength(1)
      expect(documents[0].documentName).toBe('Atomic Test Document')

      const outboxEvents = await tester.database.query(
        'SELECT * FROM event_outbox WHERE processed_at IS NULL',
      )
      expect(outboxEvents.length).toBeGreaterThanOrEqual(1)
    })

    it('should save deletion and event atomically', async () => {
      const { accessToken } = await loginService.generateTokenPair(
        UserId.fromString(TEST_USER_ID),
      )

      const createResponse = await tester.request
        .post('/api/v1/document')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ documentName: 'Document To Delete Atomically' })

      const documentId = createResponse.body.documentId

      await tester.database.query('DELETE FROM event_outbox')

      const deleteResponse = await tester.request
        .delete(`/api/v1/document/${documentId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(deleteResponse.status).toBe(StatusCodes.NO_CONTENT)

      const documents = await tester.database.query(
        'SELECT * FROM documents WHERE documentId = ?',
        [documentId],
      )
      expect(documents).toHaveLength(0)

      const outboxEvents = await tester.database.query(
        'SELECT * FROM event_outbox WHERE processed_at IS NULL AND event_name = ?',
        ['DocumentWasDeleted'],
      )
      expect(outboxEvents).toHaveLength(1)
    })
  })

  describe('multiple document operations with events', () => {
    it('should save events to outbox for each document operation independently', async () => {
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

      let outboxEvents = await tester.database.query(
        'SELECT * FROM event_outbox WHERE processed_at IS NULL AND event_name = ?',
        ['DocumentWasCreated'],
      )

      expect(outboxEvents.length).toBeGreaterThanOrEqual(2)

      await tester.request
        .delete(`/api/v1/document/${doc1.body.documentId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      outboxEvents = await tester.database.query(
        'SELECT * FROM event_outbox WHERE processed_at IS NULL AND event_name = ?',
        ['DocumentWasDeleted'],
      )

      expect(outboxEvents.length).toBeGreaterThanOrEqual(1)

      await tester.request
        .delete(`/api/v1/document/${doc2.body.documentId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      outboxEvents = await tester.database.query(
        'SELECT * FROM event_outbox WHERE processed_at IS NULL AND event_name = ?',
        ['DocumentWasDeleted'],
      )

      expect(outboxEvents.length).toBeGreaterThanOrEqual(2)
    })
  })
})
