import { TokenClaimsInterface } from '@/Authentication/Application/TokenClaimsInterface'
import { TokenCodecInterface } from '@/Authentication/Application/TokenCodecInterface'
import { TokenVerifierInterface } from '@/Authentication/Application/TokenVerifierInterface'
import { InvalidTokenException } from '@/Authentication/Domain/InvalidTokenException'
import { JwtId } from '@/Authentication/Domain/JwtId'
import { RefreshTokenRepositoryInterface } from '@/Authentication/Domain/RefreshTokenRepositoryInterface'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'

export class TokenVerifier implements TokenVerifierInterface {
  constructor(
    private readonly config: ConfigInterface,
    private readonly tokenCodec: TokenCodecInterface,
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface,
  ) {}

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
}
