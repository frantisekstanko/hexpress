import { DateTimeInterface } from '@/Core/Domain/Clock/DateTimeInterface'
import { TokenClaimsInterface } from '@/User/Application/TokenClaimsInterface'

export interface TokenCodecInterface {
  sign(
    payload: TokenClaimsInterface,
    secret: string,
    expiresAt: DateTimeInterface,
  ): string
  verify(token: string, secret: string): TokenClaimsInterface
}
