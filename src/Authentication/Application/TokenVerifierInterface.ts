import { TokenClaimsInterface } from '@/Authentication/Application/TokenClaimsInterface'

export interface TokenVerifierInterface {
  verifyAccessToken(token: string): TokenClaimsInterface
  verifyRefreshToken(token: string): Promise<TokenClaimsInterface>
}
