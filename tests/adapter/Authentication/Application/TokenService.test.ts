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
        {
          userId: USER_ID,
          type: 'refresh',
          jti: '9a1ed47c-5b9a-4a09-ba8d-075a95e469d0',
        },
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
        {
          userId: USER_ID,
          type: 'access',
          jti: 'e1b1e18b-3567-42f0-8c7e-13d11dcfc904',
        },
        config.get(ConfigOption.JWT_REFRESH_SECRET),
        { expiresIn: '1h' },
      )

      await expect(
        tokenService.verifyRefreshToken(malformedToken),
      ).rejects.toThrow(InvalidTokenException)
    })
  })
})
