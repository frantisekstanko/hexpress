import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { UuidRepositoryInterface } from '@/Core/Application/UuidRepositoryInterface'
import { ClockInterface } from '@/Core/Domain/Clock/ClockInterface'
import { DateTime } from '@/Core/Domain/Clock/DateTime'
import { UserId } from '@/Core/Domain/UserId'
import { Uuid } from '@/Core/Domain/Uuid'
import { DurationParserInterface } from '@/User/Application/DurationParserInterface'
import { TokenCodecInterface } from '@/User/Application/TokenCodecInterface'
import { TokenGenerator } from '@/User/Application/TokenGenerator'

const USER_ID = '93906a9e-250e-4151-b2e7-4f0ffcb3e11f'

describe('TokenGenerator', () => {
  let tokenGenerator: TokenGenerator
  let mockConfig: jest.Mocked<ConfigInterface>
  let mockClock: jest.Mocked<ClockInterface>
  let mockTokenCodec: jest.Mocked<TokenCodecInterface>
  let mockDurationParser: jest.Mocked<DurationParserInterface>
  let mockUuidRepository: jest.Mocked<UuidRepositoryInterface>

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

    mockUuidRepository = {
      getUuid: jest.fn(),
    } as jest.Mocked<UuidRepositoryInterface>

    mockUuidRepository.getUuid.mockReturnValue(
      Uuid.fromString('2cea7eae-eb5d-4ad0-9bd1-4cd4ffb1d8b8'),
    )

    tokenGenerator = new TokenGenerator(
      mockConfig,
      mockClock,
      mockTokenCodec,
      mockDurationParser,
      mockUuidRepository,
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

    mockUuidRepository.getUuid
      .mockReturnValueOnce(
        Uuid.fromString('b4c6abb7-3689-4603-9aa1-f6f253625791'),
      )
      .mockReturnValueOnce(
        Uuid.fromString('11f213eb-66e4-41e7-87ca-465b1507a364'),
      )

    tokenGenerator.generateAccessToken(userId)
    tokenGenerator.generateAccessToken(userId)

    const firstCall = mockTokenCodec.sign.mock.calls[0][0]
    const secondCall = mockTokenCodec.sign.mock.calls[1][0]

    expect(firstCall.jti).not.toBe(secondCall.jti)
  })
})
