import { AdapterTester } from '@Tests/_support/AdapterTester'
import { DocumentBuilder } from '@Tests/_support/builders/DocumentBuilder'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentNotFoundException } from '@/Document/Domain/DocumentNotFoundException'
import { DocumentRepository } from '@/Document/Infrastructure/DocumentRepository'

const DOCUMENT_ID = '6c9f9b89-f0e7-461b-b20f-a22b0dafe147'
const USER_ID = 'cb510e5f-89dd-408a-8201-8ed833f97bd3'
const DOCUMENT_NAME = 'Coolbelasting'

describe('DocumentRepository', () => {
  const tester = AdapterTester.setup()
  let repository: DocumentRepository

  beforeEach(() => {
    repository = new DocumentRepository(tester.getDatabase())
  })

  it('should save and retrieve a document', async () => {
    const newDocument = DocumentBuilder.create({
      documentId: DOCUMENT_ID,
      name: DOCUMENT_NAME,
      ownerId: USER_ID,
    })

    await repository.save(newDocument)

    const savedDocument = await repository.getById(
      DocumentId.fromString(DOCUMENT_ID),
    )

    expect(savedDocument.toStorage()).toEqual(newDocument.toStorage())
  })

  it('should update an existing document', async () => {
    const newUserId = 'a1234567-89ab-4def-8123-456789abcdef'
    const newName = 'Updated Document Name'

    const newDocument = DocumentBuilder.create({
      documentId: DOCUMENT_ID,
      name: DOCUMENT_NAME,
      ownerId: USER_ID,
    })

    await repository.save(newDocument)

    const updatedDocument = DocumentBuilder.create({
      documentId: DOCUMENT_ID,
      name: newName,
      ownerId: newUserId,
    })

    await repository.save(updatedDocument)

    const savedDocument = await repository.getById(
      DocumentId.fromString(DOCUMENT_ID),
    )

    expect(savedDocument.toStorage()).toEqual(updatedDocument.toStorage())
  })

  it('should throw DocumentNotFoundException when document not found', async () => {
    await expect(
      repository.getById(
        DocumentId.fromString('f254a32c-68fb-40d2-bd2e-b10608d55d31'),
      ),
    ).rejects.toThrow(DocumentNotFoundException)
  })

  it('should delete a document by id', async () => {
    const document = DocumentBuilder.create({
      documentId: DOCUMENT_ID,
      name: DOCUMENT_NAME,
      ownerId: USER_ID,
    })

    await repository.save(document)

    await repository.delete(DocumentId.fromString(DOCUMENT_ID))

    await expect(
      repository.getById(DocumentId.fromString(DOCUMENT_ID)),
    ).rejects.toThrow(DocumentNotFoundException)
  })

  it('should delete document when saved with deleted flag', async () => {
    const document = DocumentBuilder.create({
      documentId: DOCUMENT_ID,
      name: DOCUMENT_NAME,
      ownerId: USER_ID,
    })

    await repository.save(document)

    document.delete()

    await repository.save(document)

    await expect(
      repository.getById(DocumentId.fromString(DOCUMENT_ID)),
    ).rejects.toThrow(DocumentNotFoundException)
  })
})
