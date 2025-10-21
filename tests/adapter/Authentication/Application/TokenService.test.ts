import { AdapterTester } from '@Tests/_support/AdapterTester'
import jwt from 'jsonwebtoken'
import { TokenService } from '@/Authentication/Application/TokenService'
import { InvalidTokenException } from '@/Authentication/Domain/InvalidTokenException'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { Services } from '@/Core/Application/Services'

const USER_ID = '5e7aa93a-5f28-43a1-b7db-8f5adc394fe7'

describe('TokenService', () => {
  const tester = AdapterTester.setup()
  let tokenService: TokenService

  beforeEach(() => {
    tokenService = tester.container.get(TokenService)
  })

  describe('verifyAccessToken', () => {
    it('should throw error when access token has wrong type', () => {
      const config = tester.container.get(Services.ConfigInterface)
      const malformedToken = jwt.sign(
        { userId: USER_ID, type: 'refresh', jti: '123' },
        config.get(ConfigOption.JWT_ACCESS_SECRET),
        { expiresIn: '1h' },
      )

      expect(() => tokenService.verifyAccessToken(malformedToken)).toThrow(
        InvalidTokenException,
      )
    })
  })

  describe('verifyRefreshToken', () => {
    it('should throw error when refresh token has wrong type', async () => {
      const config = tester.container.get(Services.ConfigInterface)
      const malformedToken = jwt.sign(
        { userId: USER_ID, type: 'access', jti: '123' },
        config.get(ConfigOption.JWT_REFRESH_SECRET),
        { expiresIn: '1h' },
      )

      await expect(
        tokenService.verifyRefreshToken(malformedToken),
      ).rejects.toThrow(InvalidTokenException)
    })
  })
})
