import { DocumentBuilder } from '@Tests/_support/builders/DocumentBuilder'
import { FlowTester } from '@Tests/_support/FlowTester'
import { StatusCodes } from 'http-status-codes'
import { LoginService } from '@/Authentication/Application/LoginService'
import { UserId } from '@/Core/Domain/UserId'

const TEST_DOC_ID_1 = '3a0645be-4524-44d7-a14e-2f0b0cb70393'
const TEST_USER_ID_1 = '310925ee-7141-44a7-88a3-a8a91d29dfe3'
const TEST_DOC_ID_2 = 'b7eaa457-b3d7-4d41-8d81-ddc3b864ee8e'
const TEST_USER_ID_2 = '850e8400-e29b-41d4-a716-446655440003'

describe('DeleteDocument Flow', () => {
  const tester = FlowTester.setup()
  let loginService: LoginService

  beforeEach(() => {
    loginService = tester.container.get(LoginService)
  })

  it('should delete an existing document from the database', async () => {
    const document = DocumentBuilder.create({
      documentId: TEST_DOC_ID_1,
      name: 'Test Document',
      ownerId: TEST_USER_ID_1,
    })

    await tester.database.query(
      'INSERT INTO documents (documentId, documentName, ownedByUserId) VALUES (?, ?, ?)',
      [
        document.getId().toString(),
        document.getName(),
        document.getOwner().toString(),
      ],
    )

    const { accessToken } = await loginService.generateTokenPair(
      UserId.fromString(document.getOwner().toString()),
    )

    const response = await tester.request
      .delete(`/api/v1/document/${document.getId().toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(StatusCodes.NO_CONTENT)

    const documents = await tester.database.query(
      'SELECT * FROM documents WHERE documentId = ?',
      [document.getId().toString()],
    )
    expect(documents).toHaveLength(0)
  })

  it('should return 404 when document does not exist', async () => {
    const document = DocumentBuilder.create({
      documentId: TEST_DOC_ID_2,
      name: 'Nonexistent Document',
      ownerId: TEST_USER_ID_2,
    })

    const { accessToken } = await loginService.generateTokenPair(
      UserId.fromString(document.getOwner().toString()),
    )

    const response = await tester.request
      .delete(`/api/v1/document/${document.getId().toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(StatusCodes.NOT_FOUND)
  })

  it('should return 400 when document ID is invalid UUID', async () => {
    const { accessToken } = await loginService.generateTokenPair(
      UserId.fromString(TEST_USER_ID_1),
    )

    const response = await tester.request
      .delete('/api/v1/document/invalid-uuid')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
  })

  it('should return 403 when user tries to delete document of another user', async () => {
    const document = DocumentBuilder.create({
      documentId: TEST_DOC_ID_1,
      name: 'Some document of another user',
      ownerId: TEST_USER_ID_1,
    })

    await tester.database.query(
      'INSERT INTO documents (documentId, documentName, ownedByUserId) VALUES (?, ?, ?)',
      [
        document.getId().toString(),
        document.getName(),
        document.getOwner().toString(),
      ],
    )

    const { accessToken } = await loginService.generateTokenPair(
      UserId.fromString(TEST_USER_ID_2),
    )

    const response = await tester.request
      .delete(`/api/v1/document/${document.getId().toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(StatusCodes.FORBIDDEN)

    const documents = await tester.database.query(
      'SELECT * FROM documents WHERE documentId = ?',
      [document.getId().toString()],
    )
    expect(documents).toHaveLength(1)
  })

  it('should return 401 when auth token is missing', async () => {
    const response = await tester.request.delete(
      `/api/v1/document/${TEST_DOC_ID_1}`,
    )

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  it('should return 401 when auth token is invalid', async () => {
    const response = await tester.request
      .delete(`/api/v1/document/${TEST_DOC_ID_1}`)
      .set('Authorization', 'Bearer invalid.token.here')

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED)
  })
})
