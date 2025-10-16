import { AdapterTester } from '@Tests/_support/AdapterTester'
import { DocumentBuilder } from '@Tests/_support/builders/DocumentBuilder'
import { UserId } from '@/Core/Domain/UserId'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentNotFoundException } from '@/Document/Domain/DocumentNotFoundException'
import { DocumentAccessRepository } from '@/Document/Infrastructure/DocumentAccessRepository'

const DOCUMENT_ID = '7ca9afad-4b4a-44cd-ac9a-8d2ba8283d2e'
const OWNER_ID = '262b1cdf-5ca0-423a-944d-a01e9232eb59'
const OTHER_USER_ID = '8a9b0c1d-2e3f-4a5b-9c7d-8e9f0a1b2c3d'

describe('DocumentAccessRepository', () => {
  const tester = AdapterTester.setup()
  let repository: DocumentAccessRepository

  beforeEach(() => {
    repository = new DocumentAccessRepository(tester.getDatabaseContext())
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
        document.toStorage().id,
        document.toStorage().name,
        document.toStorage().owner,
      ],
    )

    const canAccess = await repository.canUserAccessDocument(
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
        document.toStorage().id,
        document.toStorage().name,
        document.toStorage().owner,
      ],
    )

    const canAccess = await repository.canUserAccessDocument(
      UserId.fromString(OTHER_USER_ID),
      DocumentId.fromString(DOCUMENT_ID),
    )

    expect(canAccess).toBe(false)
  })

  it('should throw DocumentNotFoundException when document does not exist', async () => {
    await expect(
      repository.canUserAccessDocument(
        UserId.fromString(OWNER_ID),
        DocumentId.fromString('3c8b32b5-9710-4522-8cfa-aeed9431b986'),
      ),
    ).rejects.toThrow(DocumentNotFoundException)
  })
})
