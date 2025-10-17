import { UserBuilder } from '@Tests/_support/builders/UserBuilder'
import { FlowTester } from '@Tests/_support/FlowTester'
import { StatusCodes } from 'http-status-codes'
import { LoginService } from '@/Authentication/Application/LoginService'

const USER_ID = 'e125fffe-9c1e-419e-8300-d65b6d7dcceb'
const USERNAME = 'veryCoolUser'

describe('LogoutController Flow', () => {
  const tester = FlowTester.setup()
  let loginService: LoginService

  beforeEach(() => {
    loginService = tester.container.get<LoginService>(LoginService)
  })

  it('should logout successfully and revoke refresh token', async () => {
    const user = UserBuilder.create({
      userId: USER_ID,
      username: USERNAME,
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

    const tokenExistsBefore = await tester.database.query(
      'SELECT * FROM refresh_tokens WHERE token = ?',
      [generatedTokens.refreshToken],
    )
    expect(tokenExistsBefore).toHaveLength(1)

    const response = await tester.request.post('/api/v1/logout').send({
      refreshToken: generatedTokens.refreshToken,
    })

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body).toHaveProperty('message', 'Logged out successfully')

    const tokenExistsAfter = await tester.database.query(
      'SELECT * FROM refresh_tokens WHERE token = ?',
      [generatedTokens.refreshToken],
    )
    expect(tokenExistsAfter).toHaveLength(0)
  })

  it('should handle logout with non-existent token gracefully', async () => {
    const response = await tester.request.post('/api/v1/logout').send({
      refreshToken: 'non.existent.token',
    })

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body).toHaveProperty('message', 'Logged out successfully')
  })

  it('should return 400 when refresh token is missing', async () => {
    const response = await tester.request.post('/api/v1/logout').send({})

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
  })

  it('should handle multiple logout attempts with same token', async () => {
    const user = UserBuilder.create({
      userId: USER_ID,
      username: USERNAME,
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

    const firstResponse = await tester.request.post('/api/v1/logout').send({
      refreshToken: generatedTokens.refreshToken,
    })

    expect(firstResponse.status).toBe(StatusCodes.OK)
    expect(firstResponse.body).toHaveProperty(
      'message',
      'Logged out successfully',
    )

    const secondResponse = await tester.request.post('/api/v1/logout').send({
      refreshToken: generatedTokens.refreshToken,
    })

    expect(secondResponse.status).toBe(StatusCodes.OK)
    expect(secondResponse.body).toHaveProperty(
      'message',
      'Logged out successfully',
    )
  })
})
