import { DurationParserInterface } from '@/Authentication/Application/DurationParserInterface'
import { TokenCodecInterface } from '@/Authentication/Application/TokenCodecInterface'
import { TokenGenerator } from '@/Authentication/Application/TokenGenerator'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { ClockInterface } from '@/Core/Domain/Clock/ClockInterface'
import { DateTime } from '@/Core/Domain/Clock/DateTime'
import { UserId } from '@/Core/Domain/UserId'

const USER_ID = '93906a9e-250e-4151-b2e7-4f0ffcb3e11f'

describe('TokenGenerator', () => {
  let tokenGenerator: TokenGenerator
  let mockConfig: jest.Mocked<ConfigInterface>
  let mockClock: jest.Mocked<ClockInterface>
  let mockTokenCodec: jest.Mocked<TokenCodecInterface>
  let mockDurationParser: jest.Mocked<DurationParserInterface>

  beforeEach(() => {
    mockConfig = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigInterface>

    mockClock = {
      now: jest.fn(),
    } as unknown as jest.Mocked<ClockInterface>

    mockTokenCodec = {
      sign: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
    } as unknown as jest.Mocked<TokenCodecInterface>

    mockDurationParser = {
      parseToSeconds: jest.fn(),
    } as jest.Mocked<DurationParserInterface>

    tokenGenerator = new TokenGenerator(
      mockConfig,
      mockClock,
      mockTokenCodec,
      mockDurationParser,
    )
  })

  describe('generateAccessToken', () => {
    it('should generate access token with correct parameters', () => {
      const userId = UserId.fromString(USER_ID)
      const now = new DateTime(new Date('2024-01-01T00:00:00Z'))
      const expiresAt = new DateTime(new Date('2024-01-01T01:00:00Z'))

      mockClock.now.mockReturnValue(now)
      mockDurationParser.parseToSeconds.mockReturnValue(3600)
      mockConfig.get.mockImplementation((option: ConfigOption) => {
        if (option === ConfigOption.JWT_ACCESS_EXPIRY) return '1h'
        if (option === ConfigOption.JWT_ACCESS_SECRET) return 'access-secret'
        return ''
      })
      mockTokenCodec.sign.mockReturnValue('access-token')

      const token = tokenGenerator.generateAccessToken(userId)

      expect(token).toBe('access-token')
      expect(mockTokenCodec.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: USER_ID,
          type: 'access',
          jti: expect.any(String),
        }),
        'access-secret',
        expiresAt,
      )
      expect(mockDurationParser.parseToSeconds).toHaveBeenCalledWith('1h')
    })
  })

  describe('generateRefreshToken', () => {
    it('should generate refresh token with correct parameters', () => {
      const userId = UserId.fromString(USER_ID)
      const now = new DateTime(new Date('2024-01-01T00:00:00Z'))
      const expiresAt = new DateTime(new Date('2024-01-08T00:00:00Z'))

      mockClock.now.mockReturnValue(now)
      mockDurationParser.parseToSeconds.mockReturnValue(604800)
      mockConfig.get.mockImplementation((option: ConfigOption) => {
        if (option === ConfigOption.JWT_REFRESH_EXPIRY) return '7d'
        if (option === ConfigOption.JWT_REFRESH_SECRET) return 'refresh-secret'
        return ''
      })
      mockTokenCodec.sign.mockReturnValue('refresh-token')

      const token = tokenGenerator.generateRefreshToken(userId)

      expect(token).toBe('refresh-token')
      expect(mockTokenCodec.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: USER_ID,
          type: 'refresh',
          jti: expect.any(String),
        }),
        'refresh-secret',
        expiresAt,
      )
      expect(mockDurationParser.parseToSeconds).toHaveBeenCalledWith('7d')
    })
  })

  it('should generate unique jti for each token', () => {
    const userId = UserId.fromString(USER_ID)
    const now = new DateTime(new Date('2024-01-01T00:00:00Z'))

    mockClock.now.mockReturnValue(now)
    mockDurationParser.parseToSeconds.mockReturnValue(3600)
    mockConfig.get.mockReturnValue('secret')
    mockTokenCodec.sign.mockReturnValue('token')

    tokenGenerator.generateAccessToken(userId)
    tokenGenerator.generateAccessToken(userId)

    const firstCall = mockTokenCodec.sign.mock.calls[0][0]
    const secondCall = mockTokenCodec.sign.mock.calls[1][0]

    expect(firstCall.jti).not.toBe(secondCall.jti)
  })
})
