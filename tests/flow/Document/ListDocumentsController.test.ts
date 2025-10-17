import { FlowTester } from '@Tests/_support/FlowTester'
import { StatusCodes } from 'http-status-codes'
import { LoginService } from '@/Authentication/Application/LoginService'
import { Symbols } from '@/Core/Application/Symbols'
import { UserId } from '@/Core/Domain/UserId'

const TEST_USER_ID_1 = '1333eb3b-a538-4127-bb1c-7dc46a3248b1'
const TEST_USER_ID_2 = '33c047f0-0427-46f4-8ebb-3dd8f34b23a8'

describe('ListDocuments Flow', () => {
  const tester = FlowTester.setup()
  let loginService: LoginService

  beforeEach(() => {
    loginService = tester.container.get<LoginService>(Symbols.LoginService)
  })

  it('should list documents for authenticated user', async () => {
    const { accessToken } = await loginService.generateTokenPair(
      UserId.fromString(TEST_USER_ID_1),
    )

    await tester.createDocument({
      documentName: 'First Document',
      userId: TEST_USER_ID_1,
      accessToken,
    })
    await tester.createDocument({
      documentName: 'Second Document',
      userId: TEST_USER_ID_1,
      accessToken,
    })

    const response = await tester.request
      .get('/api/v1/documents')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(StatusCodes.OK)
    const data = response.body
    expect(data.documents).toHaveLength(2)
    expect(data.documents[0]).toHaveProperty('id')
    expect(data.documents[0]).toHaveProperty('name')
    expect(data.documents[0].name).toBe('Second Document')
    expect(data.documents[1].name).toBe('First Document')
  })

  it('should return empty array when user has no documents', async () => {
    const { accessToken } = await loginService.generateTokenPair(
      UserId.fromString(TEST_USER_ID_1),
    )

    const response = await tester.request
      .get('/api/v1/documents')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(StatusCodes.OK)
    const data = response.body
    expect(data.documents).toHaveLength(0)
  })

  it('should only return documents owned by the authenticated user', async () => {
    const { accessToken: accessToken1 } = await loginService.generateTokenPair(
      UserId.fromString(TEST_USER_ID_1),
    )
    const { accessToken: accessToken2 } = await loginService.generateTokenPair(
      UserId.fromString(TEST_USER_ID_2),
    )

    await tester.createDocument({
      documentName: 'User 1 Document',
      userId: TEST_USER_ID_1,
      accessToken: accessToken1,
    })
    await tester.createDocument({
      documentName: 'User 2 Document',
      userId: TEST_USER_ID_2,
      accessToken: accessToken2,
    })

    const response = await tester.request
      .get('/api/v1/documents')
      .set('Authorization', `Bearer ${accessToken1}`)

    expect(response.status).toBe(StatusCodes.OK)
    const data = response.body
    expect(data.documents).toHaveLength(1)
    expect(data.documents[0].name).toBe('User 1 Document')
  })
})
