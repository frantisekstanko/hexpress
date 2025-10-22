import { UserBuilder } from '@Tests/_support/builders/UserBuilder'
import { FlowTester } from '@Tests/_support/FlowTester'
import { StatusCodes } from 'http-status-codes'
import { Services } from '@/Authentication/Application/Services'
import { TokenCodecInterface } from '@/Authentication/Application/TokenCodecInterface'
import { TokenService } from '@/Authentication/Application/TokenService'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { Services as CoreServices } from '@/Core/Application/Services'

const USER_ID_1 = '8ead1ea7-1fc2-49b2-a693-abfcb0e85f5a'
const USER_ID_2 = '8b5bef9c-3923-406b-b760-80f3ba7e2407'

describe('RefreshTokenController Flow', () => {
  const tester = FlowTester.setup()
  let loginService: TokenService
  let tokenCodec: TokenCodecInterface
  let config: ConfigInterface

  beforeEach(() => {
    loginService = tester.container.get(TokenService)
    tokenCodec = tester.container.get(Services.TokenCodecInterface)
    config = tester.container.get(CoreServices.ConfigInterface)
  })

  it('should refresh token successfully and revoke old token', async () => {
    const user = UserBuilder.create({
      userId: USER_ID_1,
      username: 'testuser',
      hashedPassword: 'hashedpass',
    })

    await tester.createUser(
      user.getUserId().toString(),
      user.getUsername().toString(),
      user.getPasswordHash().toString(),
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

    const oldDecodedToken = tokenCodec.verify(
      generatedTokens.refreshToken,
      config.get(ConfigOption.JWT_REFRESH_SECRET),
    )
    const oldJti = oldDecodedToken.jti

    const oldTokenExists = await tester.database.query(
      'SELECT * FROM refresh_tokens WHERE jti = ?',
      [oldJti],
    )
    expect(oldTokenExists).toHaveLength(0)

    const newDecodedToken = tokenCodec.verify(
      response.body.refreshToken,
      config.get(ConfigOption.JWT_REFRESH_SECRET),
    )
    const newJti = newDecodedToken.jti

    const newTokenExists = await tester.database.query(
      'SELECT * FROM refresh_tokens WHERE jti = ?',
      [newJti],
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
      hashedPassword: 'hashedpass',
    })

    await tester.createUser(
      user.getUserId().toString(),
      user.getUsername().toString(),
      user.getPasswordHash().toString(),
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
