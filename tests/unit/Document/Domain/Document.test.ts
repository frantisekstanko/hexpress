import { Document } from '@/Document/Domain/Document'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentWasCreated } from '@/Document/Domain/DocumentWasCreated'
import { UserId } from '@/Shared/Domain/UserId'

const DOCUMENT_ID = '52515308-fe8e-4ae0-ace4-4570ae6c33c8'
const DOCUMENT_NAME = 'Sample Test Document That We Like'
const USER_ID = 'dce00ed0-b2e1-4786-90fb-d971ed300e05'

describe('Document', () => {
  describe('create', () => {
    it('should create a new document with provided values', () => {
      const id = DocumentId.fromString(DOCUMENT_ID)
      const name = DOCUMENT_NAME
      const owner = UserId.fromString(USER_ID)

      const document = Document.create({ id, name, owner })

      const storage = document.toStorage()
      expect(storage.id).toBe(DOCUMENT_ID)
      expect(storage.name).toBe(DOCUMENT_NAME)
      expect(storage.owner).toBe(USER_ID)
      expect(storage.deleted).toBe(false)
    })

    it('should record DocumentWasCreated event when created', () => {
      const id = DocumentId.fromString(DOCUMENT_ID)
      const name = DOCUMENT_NAME
      const owner = UserId.fromString(USER_ID)

      const document = Document.create({ id, name, owner })

      const events = document.releaseEvents()

      expect(events).toHaveLength(1)

      const expectedEvent = new DocumentWasCreated({
        documentId: id,
        documentName: name,
        ownerId: owner,
      })

      expect(events[0]).toEqual(expectedEvent)
    })

    it('should clear events after releasing them', () => {
      const document = Document.create({
        id: DocumentId.fromString(DOCUMENT_ID),
        name: DOCUMENT_NAME,
        owner: UserId.fromString(USER_ID),
      })

      document.releaseEvents()

      const eventsAfterRelease = document.releaseEvents()

      expect(eventsAfterRelease).toHaveLength(0)
    })
  })

  describe('fromStorage', () => {
    it('should create document from database record', () => {
      const documentName = 'Stored Document'

      const row = {
        documentId: DOCUMENT_ID,
        documentName: documentName,
        ownedByUserId: USER_ID,
      }

      const document = Document.fromStorage(row)

      const storage = document.toStorage()
      expect(storage.id).toBe(DOCUMENT_ID)
      expect(storage.name).toBe('Stored Document')
      expect(storage.owner).toBe(USER_ID)
      expect(storage.deleted).toBe(false)
    })

    it('should throw when documentId is missing', () => {
      const row = {
        documentName: DOCUMENT_NAME,
        ownedByUserId: USER_ID,
      }

      expect(() => Document.fromStorage(row)).toThrow(
        'documentId must be a string',
      )
    })

    it('should throw when documentName is missing', () => {
      const row = {
        documentId: DOCUMENT_ID,
        ownedByUserId: USER_ID,
      }

      expect(() => Document.fromStorage(row)).toThrow(
        'documentName must be a string',
      )
    })

    it('should throw when ownedByUserId is missing', () => {
      const row = {
        documentId: DOCUMENT_ID,
        documentName: DOCUMENT_NAME,
      }

      expect(() => Document.fromStorage(row)).toThrow(
        'ownedByUserId must be a string',
      )
    })
  })

  describe('delete', () => {
    it('should mark document as deleted', () => {
      const document = Document.create({
        id: DocumentId.fromString(DOCUMENT_ID),
        name: DOCUMENT_NAME,
        owner: UserId.fromString(USER_ID),
      })

      document.delete()

      const storage = document.toStorage()
      expect(storage.deleted).toBe(true)
    })
  })
})
