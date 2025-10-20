import { inject, injectable } from 'inversify'
import { DurationParserInterface } from '@/Authentication/Application/DurationParserInterface'
import { Services } from '@/Authentication/Application/Services'
import { TokenClaimsInterface } from '@/Authentication/Application/TokenClaimsInterface'
import { TokenCodecInterface } from '@/Authentication/Application/TokenCodecInterface'
import { TokenGeneratorInterface } from '@/Authentication/Application/TokenGeneratorInterface'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { Services as CoreServices } from '@/Core/Application/Services'
import { UuidRepositoryInterface } from '@/Core/Application/UuidRepositoryInterface'
import { ClockInterface } from '@/Core/Domain/Clock/ClockInterface'
import { DateTime } from '@/Core/Domain/Clock/DateTime'
import { UserId } from '@/Core/Domain/UserId'

@injectable()
export class TokenGenerator implements TokenGeneratorInterface {
  constructor(
    @inject(CoreServices.ConfigInterface)
    private readonly config: ConfigInterface,
    @inject(CoreServices.ClockInterface)
    private readonly clock: ClockInterface,
    @inject(Services.TokenCodecInterface)
    private readonly tokenCodec: TokenCodecInterface,
    @inject(Services.DurationParserInterface)
    private readonly durationParser: DurationParserInterface,
    @inject(CoreServices.UuidRepositoryInterface)
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
      jti: this.uuidRepository.getUuid().toString(),
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
