import { FlowTester } from '@Tests/_support/FlowTester'
import { StatusCodes } from 'http-status-codes'
import { LoginService } from '@/Authentication/Application/LoginService'
import { Symbols } from '@/Core/Application/Symbols'
import { UserId } from '@/Core/Domain/UserId'

const TEST_USER_ID_1 = '86582cca-4a8c-4591-835e-ff9f18c705ed'
const TEST_USER_ID_2 = '62a81976-bc11-461b-8dfc-89d605db8a1a'
const TEST_USER_ID_3 = '06f3718b-55fc-4980-9eb9-e08302c6eab2'

describe('CreateDocument Flow', () => {
  const tester = FlowTester.setup()
  let loginService: LoginService

  beforeEach(() => {
    loginService = tester.container.get<LoginService>(Symbols.LoginService)
  })

  it('should create a document and persist it to the database', async () => {
    const { accessToken } = await loginService.generateTokenPair(
      UserId.fromString(TEST_USER_ID_1),
    )

    const response = await tester.request
      .post('/api/v1/document')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ documentName: 'My Test Document' })

    expect(response.status).toBe(StatusCodes.CREATED)
    expect(response.body).toHaveProperty('documentId')

    const documents = await tester.database.query('SELECT * FROM documents')
    expect(documents).toHaveLength(1)
    expect(documents[0].documentName).toBe('My Test Document')
    expect(documents[0].ownedByUserId).toBe(TEST_USER_ID_1)
  })

  it('should return 400 when documentName is missing', async () => {
    const { accessToken } = await loginService.generateTokenPair(
      UserId.fromString(TEST_USER_ID_2),
    )

    const response = await tester.request
      .post('/api/v1/document')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body).toHaveProperty('error')

    const documents = await tester.database.query('SELECT * FROM documents')
    expect(documents).toHaveLength(0)
  })

  it('should return 400 when documentName is empty string', async () => {
    const { accessToken } = await loginService.generateTokenPair(
      UserId.fromString(TEST_USER_ID_3),
    )

    const response = await tester.request
      .post('/api/v1/document')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ documentName: '' })

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)

    const documents = await tester.database.query('SELECT * FROM documents')
    expect(documents).toHaveLength(0)
  })
})
