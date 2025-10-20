import { TokenClaimsInterface } from '@/Authentication/Application/TokenClaimsInterface'
import { TokenCodecInterface } from '@/Authentication/Application/TokenCodecInterface'
import { TokenVerifierInterface } from '@/Authentication/Application/TokenVerifierInterface'
import { InvalidTokenException } from '@/Authentication/Domain/InvalidTokenException'
import { InvalidTokenTypeException } from '@/Authentication/Domain/InvalidTokenTypeException'
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

      const exists = await this.refreshTokenRepository.exists(token)
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
}
