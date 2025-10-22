import { AdapterTester } from '@Tests/_support/AdapterTester'
import { DocumentBuilder } from '@Tests/_support/builders/DocumentBuilder'
import { UserId } from '@/Core/Domain/UserId'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentNotFoundException } from '@/Document/Domain/DocumentNotFoundException'
import { DocumentRepository } from '@/Document/Infrastructure/DocumentRepository'
import { DocumentsRepository } from '@/Document/Infrastructure/DocumentsRepository'

const USER_ID = 'cfd1e3da-5162-4a0e-b2c9-c50bb415b573'
const ANOTHER_USER_ID = '50118c7a-8f18-4af7-a59e-021c71ebceda'
const DOCUMENT_ID_1 = '01622ea3-d171-472d-87b5-05cbf1144da3'
const DOCUMENT_ID_2 = '31aca58d-5cee-48ef-a2af-ec9d925ebe5d'
const DOCUMENT_NAME_1 = 'First Document'
const DOCUMENT_NAME_2 = 'Second Document'
const DOCUMENT_ID = '7ca9afad-4b4a-44cd-ac9a-8d2ba8283d2e'
const OWNER_ID = '262b1cdf-5ca0-423a-944d-a01e9232eb59'
const OTHER_USER_ID = '8a9b0c1d-2e3f-4a5b-9c7d-8e9f0a1b2c3d'

describe('DocumentsRepository', () => {
  const tester = AdapterTester.setup()
  let documentsRepository: DocumentsRepository
  let documentRepository: DocumentRepository

  beforeEach(() => {
    documentsRepository = new DocumentsRepository(tester.getDatabaseContext())
    documentRepository = new DocumentRepository(tester.getDatabaseContext())
  })

  it('should retrieve documents by user id', async () => {
    const document1 = DocumentBuilder.create({
      documentId: DOCUMENT_ID_1,
      name: DOCUMENT_NAME_1,
      ownerId: USER_ID,
    })

    const document2 = DocumentBuilder.create({
      documentId: DOCUMENT_ID_2,
      name: DOCUMENT_NAME_2,
      ownerId: USER_ID,
    })

    await documentRepository.save(document1)
    await documentRepository.save(document2)

    const documents = await documentsRepository.getDocumentsByUserId(
      UserId.fromString(USER_ID),
    )

    expect(documents).toHaveLength(2)
    expect(documents[0].getDocumentId()).toBe(DOCUMENT_ID_2)
    expect(documents[0].getDocumentName()).toBe(DOCUMENT_NAME_2)
    expect(documents[1].getDocumentId()).toBe(DOCUMENT_ID_1)
    expect(documents[1].getDocumentName()).toBe(DOCUMENT_NAME_1)
  })

  it('should return empty array when user has no documents', async () => {
    const documents = await documentsRepository.getDocumentsByUserId(
      UserId.fromString(USER_ID),
    )

    expect(documents).toHaveLength(0)
  })

  it('should only return documents for specified user', async () => {
    const userDocument = DocumentBuilder.create({
      documentId: DOCUMENT_ID_1,
      name: DOCUMENT_NAME_1,
      ownerId: USER_ID,
    })

    const otherUserDocument = DocumentBuilder.create({
      documentId: DOCUMENT_ID_2,
      name: DOCUMENT_NAME_2,
      ownerId: ANOTHER_USER_ID,
    })

    await documentRepository.save(userDocument)
    await documentRepository.save(otherUserDocument)

    const documents = await documentsRepository.getDocumentsByUserId(
      UserId.fromString(USER_ID),
    )

    expect(documents).toHaveLength(1)
    expect(documents[0].getDocumentId()).toBe(DOCUMENT_ID_1)
  })

  it('should return true when user owns the document', async () => {
    const document = DocumentBuilder.create({
      documentId: DOCUMENT_ID,
      name: 'any name including any entropy',
      ownerId: OWNER_ID,
    })

    await tester.database.query(
      'INSERT INTO documents (documentId, documentName, ownedByUserId) VALUES (?, ?, ?)',
      [
        document.getId().toString(),
        document.getName().toString(),
        document.getOwner().toString(),
      ],
    )

    const canAccess = await documentsRepository.canUserAccessDocument(
      UserId.fromString(OWNER_ID),
      DocumentId.fromString(DOCUMENT_ID),
    )

    expect(canAccess).toBe(true)
  })

  it('should return false when user does not own the document', async () => {
    const document = DocumentBuilder.create({
      documentId: DOCUMENT_ID,
      name: 'what is the meaning of life?',
      ownerId: OWNER_ID,
    })

    await tester.database.query(
      'INSERT INTO documents (documentId, documentName, ownedByUserId) VALUES (?, ?, ?)',
      [
        document.getId().toString(),
        document.getName().toString(),
        document.getOwner().toString(),
      ],
    )

    const canAccess = await documentsRepository.canUserAccessDocument(
      UserId.fromString(OTHER_USER_ID),
      DocumentId.fromString(DOCUMENT_ID),
    )

    expect(canAccess).toBe(false)
  })

  it('should throw DocumentNotFoundException when document does not exist', async () => {
    await expect(
      documentsRepository.canUserAccessDocument(
        UserId.fromString(OWNER_ID),
        DocumentId.fromString('3c8b32b5-9710-4522-8cfa-aeed9431b986'),
      ),
    ).rejects.toThrow(DocumentNotFoundException)
  })
})
