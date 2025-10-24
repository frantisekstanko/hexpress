import { TokenService } from '@/Authentication/Application/TokenService'
import { InvalidTokenException } from '@/Authentication/Domain/InvalidTokenException'
import { AuthenticationHandler } from '@/Authentication/Infrastructure/AuthenticationHandler'

const USER_ID = '93906a9e-250e-4151-b2e7-4f0ffcb3e11f'

describe('AuthenticationHandler', () => {
  let authenticationHandler: AuthenticationHandler
  let mockTokenService: jest.Mocked<TokenService>

  beforeEach(() => {
    mockTokenService = {
      verifyAccessToken: jest.fn(),
    } as unknown as jest.Mocked<TokenService>

    authenticationHandler = new AuthenticationHandler(mockTokenService)
  })

  describe('authenticateFromMessage', () => {
    it('should authenticate user with valid token', () => {
      const data = { type: 'auth', token: 'valid-token' }
      mockTokenService.verifyAccessToken.mockReturnValue({
        userId: USER_ID,
        type: 'access',
        jti: '4393800a-363b-4a8d-bcb2-1339ab73fdb8',
        exp: 9999999999,
      })

      const result = authenticationHandler.authenticateFromMessage(data)

      expect(result.getUserId().toString()).toBe(USER_ID)
      expect(mockTokenService.verifyAccessToken).toHaveBeenCalledWith(
        'valid-token',
      )
    })

    it('should throw InvalidTokenException when type is missing', () => {
      const data = { token: 'valid-token' }

      expect(() => authenticationHandler.authenticateFromMessage(data)).toThrow(
        InvalidTokenException,
      )
      expect(() => authenticationHandler.authenticateFromMessage(data)).toThrow(
        'Invalid authentication message format',
      )
    })

    it('should throw InvalidTokenException when token is missing', () => {
      const data = { type: 'auth' }

      expect(() => authenticationHandler.authenticateFromMessage(data)).toThrow(
        InvalidTokenException,
      )
    })

    it('should throw InvalidTokenException when token is not a string', () => {
      const data = { type: 'auth', token: 123 }

      expect(() => authenticationHandler.authenticateFromMessage(data)).toThrow(
        InvalidTokenException,
      )
    })

    it('should propagate InvalidTokenException from TokenService', () => {
      const data = { type: 'auth', token: 'invalid-token' }
      mockTokenService.verifyAccessToken.mockImplementation(() => {
        throw new InvalidTokenException('Invalid token')
      })

      expect(() => authenticationHandler.authenticateFromMessage(data)).toThrow(
        InvalidTokenException,
      )
    })
  })
})
