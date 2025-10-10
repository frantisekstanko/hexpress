import { Document } from '@/Document/Application/ReadModel/Document'

const DOCUMENT_ID = '9cf812c5-30b3-4904-a7b0-e9d7cb39783f'
const DOCUMENT_NAME = 'Test Document'

describe('Document ReadModel', () => {
  it('should create document with id and name', () => {
    const document = new Document({ id: DOCUMENT_ID, name: DOCUMENT_NAME })

    expect(document.getDocumentId()).toBe(DOCUMENT_ID)
    expect(document.getDocumentName()).toBe(DOCUMENT_NAME)
  })
})
