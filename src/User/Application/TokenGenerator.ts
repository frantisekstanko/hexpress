import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { UuidRepositoryInterface } from '@/Core/Application/UuidRepositoryInterface'
import { ClockInterface } from '@/Core/Domain/Clock/ClockInterface'
import { DateTime } from '@/Core/Domain/Clock/DateTime'
import { UserId } from '@/Core/Domain/UserId'
import { DurationParserInterface } from '@/User/Application/DurationParserInterface'
import { TokenClaimsInterface } from '@/User/Application/TokenClaimsInterface'
import { TokenCodecInterface } from '@/User/Application/TokenCodecInterface'
import { TokenGeneratorInterface } from '@/User/Application/TokenGeneratorInterface'
import { JwtId } from '@/User/Domain/JwtId'

export class TokenGenerator implements TokenGeneratorInterface {
  constructor(
    private readonly config: ConfigInterface,
    private readonly clock: ClockInterface,
    private readonly tokenCodec: TokenCodecInterface,
    private readonly durationParser: DurationParserInterface,
    private readonly uuidRepository: UuidRepositoryInterface,
  ) {}

  generateAccessToken(userId: UserId): string {
    return this.generateToken(
      userId,
      'access',
      ConfigOption.JWT_ACCESS_SECRET,
      ConfigOption.JWT_ACCESS_EXPIRY,
    )
  }

  generateRefreshToken(userId: UserId): string {
    return this.generateToken(
      userId,
      'refresh',
      ConfigOption.JWT_REFRESH_SECRET,
      ConfigOption.JWT_REFRESH_EXPIRY,
    )
  }

  private generateToken(
    userId: UserId,
    type: 'access' | 'refresh',
    secretOption: ConfigOption,
    expiryOption: ConfigOption,
  ): string {
    const payload = {
      userId: userId.toString(),
      type,
      jti: new JwtId(this.uuidRepository.getUuid()).toString(),
    } as TokenClaimsInterface

    const durationString = this.config.get(expiryOption)
    const expiresAt = this.calculateExpiryDateTime(durationString)

    return this.tokenCodec.sign(
      payload,
      this.config.get(secretOption),
      expiresAt,
    )
  }

  private calculateExpiryDateTime(duration: string): DateTime {
    const seconds = this.durationParser.parseToSeconds(duration)
    const now = this.clock.now()
    const expiryDate = new Date(now.toDate().getTime() + seconds * 1000)

    return new DateTime(expiryDate)
  }
}
