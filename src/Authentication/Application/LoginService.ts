import { randomUUID } from 'node:crypto'
import { inject, injectable } from 'inversify'
import { Symbols as AuthSymbols } from '@/Authentication/Application/Symbols'
import { TokenClaimsInterface } from '@/Authentication/Application/TokenClaimsInterface'
import { TokenCodecInterface } from '@/Authentication/Application/TokenCodecInterface'
import { TokenPair } from '@/Authentication/Application/TokenPair'
import { InvalidCredentialsException } from '@/Authentication/Domain/InvalidCredentialsException'
import { InvalidTokenException } from '@/Authentication/Domain/InvalidTokenException'
import { InvalidTokenTypeException } from '@/Authentication/Domain/InvalidTokenTypeException'
import { RefreshTokenRepositoryInterface } from '@/Authentication/Domain/RefreshTokenRepositoryInterface'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { Symbols as CoreSymbols } from '@/Core/Application/Symbols'
import { ClockInterface } from '@/Core/Domain/Clock/ClockInterface'
import { DateTime } from '@/Core/Domain/Clock/DateTime'
import { UserId } from '@/Core/Domain/UserId'
import { PasswordHasherInterface } from '@/User/Application/PasswordHasherInterface'
import { Symbols as UserSymbols } from '@/User/Application/Symbols'
import { UserRepositoryInterface } from '@/User/Domain/UserRepositoryInterface'

@injectable()
export class LoginService {
  constructor(
    @inject(CoreSymbols.ConfigInterface)
    private readonly config: ConfigInterface,
    @inject(CoreSymbols.ClockInterface)
    private readonly clock: ClockInterface,
    @inject(AuthSymbols.TokenCodecInterface)
    private readonly tokenCodec: TokenCodecInterface,
    @inject(AuthSymbols.RefreshTokenRepositoryInterface)
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface,
    @inject(UserSymbols.UserRepositoryInterface)
    private readonly userRepository: UserRepositoryInterface,
    @inject(UserSymbols.PasswordHasherInterface)
    private readonly passwordHasher: PasswordHasherInterface,
  ) {}

  async generateTokenPair(userId: UserId): Promise<TokenPair> {
    const accessToken = this.generateAccessToken(userId)
    const refreshToken = this.generateRefreshToken(userId)

    await this.storeRefreshToken(refreshToken, userId)

    return { accessToken, refreshToken }
  }

  verifyAccessToken(token: string): TokenClaimsInterface {
    try {
      const payload = this.tokenCodec.verify(
        token,
        this.config.get(ConfigOption.JWT_ACCESS_SECRET),
      )

      if (payload.type !== 'access') {
        throw new InvalidTokenTypeException('Invalid token type')
      }

      return payload
    } catch (error) {
      if (error instanceof InvalidTokenTypeException) {
        throw error
      }
      throw new InvalidTokenException('Invalid or expired access token')
    }
  }

  async verifyRefreshToken(token: string): Promise<TokenClaimsInterface> {
    try {
      const payload = this.tokenCodec.verify(
        token,
        this.config.get(ConfigOption.JWT_REFRESH_SECRET),
      )

      if (payload.type !== 'refresh') {
        throw new InvalidTokenTypeException('Invalid token type')
      }

      const exists = await this.refreshTokenExists(token)
      if (!exists) {
        throw new InvalidTokenException('Refresh token has been revoked')
      }

      return payload
    } catch (error) {
      if (
        error instanceof InvalidTokenTypeException ||
        error instanceof InvalidTokenException
      ) {
        throw error
      }
      throw new InvalidTokenException('Invalid or expired refresh token')
    }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.revoke(token)
  }

  public async authenticateUser(
    username: string,
    password: string,
  ): Promise<UserId> {
    const user = await this.userRepository.getByUsername(username)
    const passwordMatches = await this.passwordHasher.verifyPassword(
      password,
      user.getPasswordHash(),
    )

    if (!passwordMatches) {
      throw new InvalidCredentialsException('Invalid credentials')
    }

    return user.getUserId()
  }

  private generateAccessToken(userId: UserId): string {
    return this.generateToken(
      userId,
      'access',
      ConfigOption.JWT_ACCESS_SECRET,
      ConfigOption.JWT_ACCESS_EXPIRY,
    )
  }

  private generateRefreshToken(userId: UserId): string {
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
      jti: randomUUID(),
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
    const seconds = this.parseDurationToSeconds(duration)
    const now = this.clock.now()
    const expiryDate = new Date(now.toDate().getTime() + seconds * 1000)

    return new DateTime(expiryDate)
  }

  private parseDurationToSeconds(duration: string): number {
    const match = /^(\d+)([smhd])$/.exec(duration)
    if (!match) {
      throw new Error(`Invalid duration format: ${duration}`)
    }

    const value = Number.parseInt(match[1], 10)
    const unit = match[2]

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    }

    return value * multipliers[unit]
  }

  private async storeRefreshToken(
    token: string,
    userId: UserId,
  ): Promise<void> {
    const decoded = this.tokenCodec.decode(token)

    await this.refreshTokenRepository.store(token, userId, decoded.expiresAt)
  }

  private async refreshTokenExists(token: string): Promise<boolean> {
    return await this.refreshTokenRepository.exists(token)
  }
}
