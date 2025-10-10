import { AdapterTester } from '@Tests/_support/AdapterTester'
import jwt from 'jsonwebtoken'
import { ConfigInterface } from '@/Shared/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Shared/Application/Config/ConfigOption'
import { LoginService } from '@/Shared/Application/LoginService'
import { Symbols } from '@/Shared/Application/Symbols'

const USER_ID = '5e7aa93a-5f28-43a1-b7db-8f5adc394fe7'

describe('LoginService', () => {
  const tester = AdapterTester.setup()
  let loginService: LoginService

  beforeEach(() => {
    loginService = tester.container.get<LoginService>(Symbols.LoginService)
  })

  describe('verifyAccessToken', () => {
    it('should throw error when access token has wrong type', () => {
      const config = tester.container.get<ConfigInterface>(
        Symbols.ConfigInterface,
      )
      const malformedToken = jwt.sign(
        { userId: USER_ID, type: 'refresh', jti: '123' },
        config.get(ConfigOption.JWT_ACCESS_SECRET),
        { expiresIn: '1h' },
      )

      expect(() => loginService.verifyAccessToken(malformedToken)).toThrow(
        'Invalid or expired access token',
      )
    })
  })

  describe('verifyRefreshToken', () => {
    it('should throw error when refresh token has wrong type', async () => {
      const config = tester.container.get<ConfigInterface>(
        Symbols.ConfigInterface,
      )
      const malformedToken = jwt.sign(
        { userId: USER_ID, type: 'access', jti: '123' },
        config.get(ConfigOption.JWT_REFRESH_SECRET),
        { expiresIn: '1h' },
      )

      await expect(
        loginService.verifyRefreshToken(malformedToken),
      ).rejects.toThrow('Invalid or expired refresh token')
    })
  })
})
