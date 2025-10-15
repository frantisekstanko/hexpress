import { UserBuilder } from '@Tests/_support/builders/UserBuilder'
import { FlowTester } from '@Tests/_support/FlowTester'
import { StatusCodes } from 'http-status-codes'
import { LoginService } from '@/Shared/Application/LoginService'
import { Symbols } from '@/Shared/Application/Symbols'

const USER_ID_1 = '8ead1ea7-1fc2-49b2-a693-abfcb0e85f5a'
const USER_ID_2 = '8b5bef9c-3923-406b-b760-80f3ba7e2407'

describe('RefreshTokenController Flow', () => {
  const tester = FlowTester.setup()
  let loginService: LoginService

  beforeEach(() => {
    loginService = tester.container.get<LoginService>(Symbols.LoginService)
  })

  it('should refresh token successfully and revoke old token', async () => {
    const user = UserBuilder.create({
      userId: USER_ID_1,
      username: 'testuser',
      password: 'hashedpass',
    })

    await tester.createUser(
      user.getUserId().toString(),
      user.toStorage().username,
      user.toStorage().password,
    )

    const generatedTokens = await loginService.generateTokenPair(
      user.getUserId(),
    )

    const response = await tester.request.post('/api/v1/refresh-token').send({
      refreshToken: generatedTokens.refreshToken,
    })

    expect(response.status).toBe(StatusCodes.OK)

    expect(response.body).toHaveProperty('accessToken')
    expect(response.body).toHaveProperty('refreshToken')
    expect(response.body.accessToken).not.toBe(generatedTokens.accessToken)
    expect(response.body.refreshToken).not.toBe(generatedTokens.refreshToken)

    const oldTokenExists = await tester.database.query(
      'SELECT * FROM refresh_tokens WHERE token = ?',
      [generatedTokens.refreshToken],
    )
    expect(oldTokenExists).toHaveLength(0)

    const newTokenExists = await tester.database.query(
      'SELECT * FROM refresh_tokens WHERE token = ?',
      [response.body.refreshToken],
    )
    expect(newTokenExists).toHaveLength(1)
  })

  it('should return 401 with invalid token', async () => {
    const response = await tester.request.post('/api/v1/refresh-token').send({
      refreshToken: 'invalid.jwt.token',
    })

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED)
    expect(response.body).toHaveProperty(
      'error',
      'Invalid or expired refresh token',
    )
  })

  it('should return 401 with revoked token', async () => {
    const user = UserBuilder.create({
      userId: USER_ID_2,
      username: 'testuser2',
      password: 'hashedpass',
    })

    await tester.createUser(
      user.getUserId().toString(),
      user.toStorage().username,
      user.toStorage().password,
    )

    const generatedTokens = await loginService.generateTokenPair(
      user.getUserId(),
    )

    await loginService.revokeRefreshToken(generatedTokens.refreshToken)

    const response = await tester.request.post('/api/v1/refresh-token').send({
      refreshToken: generatedTokens.refreshToken,
    })

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED)
    expect(response.body).toHaveProperty(
      'error',
      'Invalid or expired refresh token',
    )
  })

  it('should return 400 when refresh token is missing', async () => {
    const response = await tester.request.post('/api/v1/refresh-token').send({})

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
  })
})
