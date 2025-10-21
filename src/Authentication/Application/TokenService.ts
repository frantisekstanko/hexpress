import { TokenClaimsInterface } from '@/Authentication/Application/TokenClaimsInterface'
import { TokenCodecInterface } from '@/Authentication/Application/TokenCodecInterface'
import { TokenGeneratorInterface } from '@/Authentication/Application/TokenGeneratorInterface'
import { TokenPair } from '@/Authentication/Application/TokenPair'
import { TokenVerifierInterface } from '@/Authentication/Application/TokenVerifierInterface'
import { JwtId } from '@/Authentication/Domain/JwtId'
import { RefreshTokenRepositoryInterface } from '@/Authentication/Domain/RefreshTokenRepositoryInterface'
import { DateTime } from '@/Core/Domain/Clock/DateTime'
import { UserId } from '@/Core/Domain/UserId'

export class TokenService {
  constructor(
    private readonly tokenGenerator: TokenGeneratorInterface,
    private readonly tokenVerifier: TokenVerifierInterface,
    private readonly tokenCodec: TokenCodecInterface,
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface,
  ) {}

  async generateTokenPair(userId: UserId): Promise<TokenPair> {
    const accessToken = this.tokenGenerator.generateAccessToken(userId)
    const refreshToken = this.tokenGenerator.generateRefreshToken(userId)

    await this.storeRefreshToken(refreshToken, userId)

    return { accessToken, refreshToken }
  }

  verifyAccessToken(token: string): TokenClaimsInterface {
    return this.tokenVerifier.verifyAccessToken(token)
  }

  async verifyRefreshToken(token: string): Promise<TokenClaimsInterface> {
    return await this.tokenVerifier.verifyRefreshToken(token)
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const claims = await this.tokenVerifier.verifyRefreshToken(token)
    const jti = JwtId.fromString(claims.jti)
    await this.refreshTokenRepository.revoke(jti)
  }

  private async storeRefreshToken(
    token: string,
    userId: UserId,
  ): Promise<void> {
    const claims = this.tokenCodec.decode(token)
    const jti = JwtId.fromString(claims.jti)
    const expiresAt = new DateTime(new Date(claims.exp * 1000))

    await this.refreshTokenRepository.store(jti, userId, expiresAt)
  }
}
