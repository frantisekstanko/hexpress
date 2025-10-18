import { DecodedTokenInterface } from '@/Authentication/Application/DecodedTokenInterface'
import { TokenClaimsInterface } from '@/Authentication/Application/TokenClaimsInterface'
import { DateTimeInterface } from '@/Core/Domain/Clock/DateTimeInterface'

export interface TokenCodecInterface {
  sign(
    payload: TokenClaimsInterface,
    secret: string,
    expiresAt: DateTimeInterface,
  ): string
  verify(token: string, secret: string): TokenClaimsInterface
  decode(token: string): DecodedTokenInterface
}
