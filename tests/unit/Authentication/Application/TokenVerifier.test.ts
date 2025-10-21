import { TokenCodecInterface } from '@/Authentication/Application/TokenCodecInterface'
import { TokenVerifier } from '@/Authentication/Application/TokenVerifier'
import { InvalidTokenException } from '@/Authentication/Domain/InvalidTokenException'
import { RefreshTokenRepositoryInterface } from '@/Authentication/Domain/RefreshTokenRepositoryInterface'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'

const USER_ID = '93906a9e-250e-4151-b2e7-4f0ffcb3e11f'

describe('TokenVerifier', () => {
  let tokenVerifier: TokenVerifier
  let mockConfig: jest.Mocked<ConfigInterface>
  let mockTokenCodec: jest.Mocked<TokenCodecInterface>
  let mockRefreshTokenRepository: jest.Mocked<RefreshTokenRepositoryInterface>

  beforeEach(() => {
    mockConfig = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigInterface>

    mockTokenCodec = {
      sign: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
    } as unknown as jest.Mocked<TokenCodecInterface>

    mockRefreshTokenRepository = {
      store: jest.fn(),
      exists: jest.fn(),
      revoke: jest.fn(),
    } as jest.Mocked<RefreshTokenRepositoryInterface>

    tokenVerifier = new TokenVerifier(
      mockConfig,
      mockTokenCodec,
      mockRefreshTokenRepository,
    )
  })

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      mockConfig.get.mockReturnValue('access-secret')
      mockTokenCodec.verify.mockReturnValue({
        userId: USER_ID,
        type: 'access',
        jti: '09321cbf-4e70-4769-a5a5-f8670e9d9f2f',
        exp: 9999999999,
      })

      const result = tokenVerifier.verifyAccessToken('valid-token')

      expect(result).toEqual({
        userId: USER_ID,
        type: 'access',
        jti: '09321cbf-4e70-4769-a5a5-f8670e9d9f2f',
        exp: 9999999999,
      })
      expect(mockTokenCodec.verify).toHaveBeenCalledWith(
        'valid-token',
        'access-secret',
      )
    })

    it('should throw InvalidTokenTypeException when token type is not access', () => {
      mockConfig.get.mockReturnValue('access-secret')
      mockTokenCodec.verify.mockReturnValue({
        userId: USER_ID,
        type: 'refresh',
        jti: '8132f51c-75bb-46f9-8afd-06d6e394dc72',
        exp: 9999999999,
      })

      expect(() =>
        tokenVerifier.verifyAccessToken('invalid-type-token'),
      ).toThrow(InvalidTokenException)
    })

    it('should throw InvalidTokenException when codec verification fails', () => {
      mockConfig.get.mockReturnValue('access-secret')
      mockTokenCodec.verify.mockImplementation(() => {
        throw new InvalidTokenException('Invalid or expired token')
      })

      expect(() => tokenVerifier.verifyAccessToken('invalid-token')).toThrow(
        InvalidTokenException,
      )
      expect(() => tokenVerifier.verifyAccessToken('invalid-token')).toThrow(
        'Invalid or expired token',
      )
    })
  })

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', async () => {
      mockConfig.get.mockReturnValue('refresh-secret')
      mockTokenCodec.verify.mockReturnValue({
        userId: USER_ID,
        type: 'refresh',
        jti: 'd69113aa-dd8a-4bbc-a1a2-09a00504cd9e',
        exp: 9999999999,
      })
      mockRefreshTokenRepository.exists.mockResolvedValue(true)

      const result = await tokenVerifier.verifyRefreshToken(
        'valid-refresh-token',
      )

      expect(result).toEqual({
        userId: USER_ID,
        type: 'refresh',
        jti: 'd69113aa-dd8a-4bbc-a1a2-09a00504cd9e',
        exp: 9999999999,
      })
      expect(mockTokenCodec.verify).toHaveBeenCalledWith(
        'valid-refresh-token',
        'refresh-secret',
      )
      expect(mockRefreshTokenRepository.exists).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.objectContaining({
            value: 'd69113aa-dd8a-4bbc-a1a2-09a00504cd9e',
          }),
        }),
      )
    })

    it('should throw InvalidTokenTypeException when token type is not refresh', async () => {
      mockConfig.get.mockReturnValue('refresh-secret')
      mockTokenCodec.verify.mockReturnValue({
        userId: USER_ID,
        type: 'access',
        jti: '74bc7dd7-cfe5-41c7-b026-3b7a9754aef3',
        exp: 9999999999,
      })

      await expect(
        tokenVerifier.verifyRefreshToken('invalid-type-token'),
      ).rejects.toThrow(InvalidTokenException)
    })

    it('should throw InvalidTokenException when token is revoked', async () => {
      mockConfig.get.mockReturnValue('refresh-secret')
      mockTokenCodec.verify.mockReturnValue({
        userId: USER_ID,
        type: 'refresh',
        jti: '6629bb76-f370-4010-8f4b-aca52c5d6067',
        exp: 9999999999,
      })
      mockRefreshTokenRepository.exists.mockResolvedValue(false)

      await expect(
        tokenVerifier.verifyRefreshToken('revoked-token'),
      ).rejects.toThrow(InvalidTokenException)
      await expect(
        tokenVerifier.verifyRefreshToken('revoked-token'),
      ).rejects.toThrow('Refresh token has been revoked')
    })

    it('should throw InvalidTokenException when codec verification fails', async () => {
      mockConfig.get.mockReturnValue('refresh-secret')
      mockTokenCodec.verify.mockImplementation(() => {
        throw new InvalidTokenException('Invalid or expired token')
      })

      await expect(
        tokenVerifier.verifyRefreshToken('invalid-token'),
      ).rejects.toThrow(InvalidTokenException)
      await expect(
        tokenVerifier.verifyRefreshToken('invalid-token'),
      ).rejects.toThrow('Invalid or expired token')
    })
  })
})
