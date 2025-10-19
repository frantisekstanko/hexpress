import { inject, injectable } from 'inversify'
import { Services } from '@/Authentication/Application/Services'
import { TokenClaimsInterface } from '@/Authentication/Application/TokenClaimsInterface'
import { TokenCodecInterface } from '@/Authentication/Application/TokenCodecInterface'
import { TokenGeneratorInterface } from '@/Authentication/Application/TokenGeneratorInterface'
import { TokenPair } from '@/Authentication/Application/TokenPair'
import { TokenVerifierInterface } from '@/Authentication/Application/TokenVerifierInterface'
import { UserAuthenticatorInterface } from '@/Authentication/Application/UserAuthenticatorInterface'
import { RefreshTokenRepositoryInterface } from '@/Authentication/Domain/RefreshTokenRepositoryInterface'
import { UserId } from '@/Core/Domain/UserId'

@injectable()
export class LoginService {
  constructor(
    @inject(Services.TokenGeneratorInterface)
    private readonly tokenGenerator: TokenGeneratorInterface,
    @inject(Services.TokenVerifierInterface)
    private readonly tokenVerifier: TokenVerifierInterface,
    @inject(Services.UserAuthenticatorInterface)
    private readonly userAuthenticator: UserAuthenticatorInterface,
    @inject(Services.TokenCodecInterface)
    private readonly tokenCodec: TokenCodecInterface,
    @inject(Services.RefreshTokenRepositoryInterface)
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
    await this.refreshTokenRepository.revoke(token)
  }

  async authenticateUser(username: string, password: string): Promise<UserId> {
    return await this.userAuthenticator.authenticate(username, password)
  }

  private async storeRefreshToken(
    token: string,
    userId: UserId,
  ): Promise<void> {
    const decoded = this.tokenCodec.decode(token)

    await this.refreshTokenRepository.store(token, userId, decoded.expiresAt)
  }
}
