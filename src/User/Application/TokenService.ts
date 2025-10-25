import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { DateTime } from '@/Core/Domain/Clock/DateTime'
import { UserId } from '@/Core/Domain/UserId'
import { TokenClaimsInterface } from '@/User/Application/TokenClaimsInterface'
import { TokenCodecInterface } from '@/User/Application/TokenCodecInterface'
import { TokenGeneratorInterface } from '@/User/Application/TokenGeneratorInterface'
import { TokenPair } from '@/User/Application/TokenPair'
import { InvalidTokenException } from '@/User/Domain/InvalidTokenException'
import { JwtId } from '@/User/Domain/JwtId'
import { RefreshTokenRepositoryInterface } from '@/User/Domain/RefreshTokenRepositoryInterface'

export class TokenService {
  constructor(
    private readonly tokenGenerator: TokenGeneratorInterface,
    private readonly tokenCodec: TokenCodecInterface,
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface,
    private readonly config: ConfigInterface,
  ) {}

  async generateTokenPair(userId: UserId): Promise<TokenPair> {
    const accessToken = this.tokenGenerator.generateAccessToken(userId)
    const refreshToken = this.tokenGenerator.generateRefreshToken(userId)

    await this.storeRefreshToken(refreshToken, userId)

    return { accessToken, refreshToken }
  }

  verifyAccessToken(token: string): TokenClaimsInterface {
    const payload = this.tokenCodec.verify(
      token,
      this.config.get(ConfigOption.JWT_ACCESS_SECRET),
    )

    if (payload.type !== 'access') {
      throw new InvalidTokenException('Invalid token type')
    }

    return payload
  }

  async verifyRefreshToken(token: string): Promise<TokenClaimsInterface> {
    const payload = this.tokenCodec.verify(
      token,
      this.config.get(ConfigOption.JWT_REFRESH_SECRET),
    )

    if (payload.type !== 'refresh') {
      throw new InvalidTokenException('Invalid token type')
    }

    const jti = JwtId.fromString(payload.jti)
    const exists = await this.refreshTokenRepository.exists(jti)

    if (!exists) {
      throw new InvalidTokenException('Refresh token has been revoked')
    }

    return payload
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const claims = await this.verifyRefreshToken(token)
    const jti = JwtId.fromString(claims.jti)
    await this.refreshTokenRepository.revoke(jti)
  }

  private async storeRefreshToken(
    token: string,
    userId: UserId,
  ): Promise<void> {
    const claims = this.tokenCodec.verify(
      token,
      this.config.get(ConfigOption.JWT_REFRESH_SECRET),
    )
    const jti = JwtId.fromString(claims.jti)
    const expiresAt = new DateTime(new Date(claims.exp * 1000))

    await this.refreshTokenRepository.store(jti, userId, expiresAt)
  }
}
