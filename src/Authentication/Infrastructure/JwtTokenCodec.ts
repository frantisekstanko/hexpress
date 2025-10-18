import { inject, injectable } from 'inversify'
import jwt, { SignOptions } from 'jsonwebtoken'
import { DecodedTokenInterface } from '@/Authentication/Application/DecodedTokenInterface'
import { TokenClaimsInterface } from '@/Authentication/Application/TokenClaimsInterface'
import { TokenCodecInterface } from '@/Authentication/Application/TokenCodecInterface'
import { InvalidTokenException } from '@/Authentication/Domain/InvalidTokenException'
import { Symbols } from '@/Core/Application/Symbols'
import { ClockInterface } from '@/Core/Domain/Clock/ClockInterface'
import { DateTime } from '@/Core/Domain/Clock/DateTime'
import { DateTimeInterface } from '@/Core/Domain/Clock/DateTimeInterface'

@injectable()
export class JwtTokenCodec implements TokenCodecInterface {
  constructor(
    @inject(Symbols.ClockInterface)
    private readonly clock: ClockInterface,
  ) {}

  sign(
    payload: TokenClaimsInterface,
    secret: string,
    expiresAt: DateTimeInterface,
  ): string {
    const expiresAtSeconds = Math.floor(expiresAt.toDate().getTime() / 1000)
    const nowSeconds = Math.floor(this.clock.now().toDate().getTime() / 1000)
    const expiresInSeconds = expiresAtSeconds - nowSeconds

    return jwt.sign(payload, secret, {
      expiresIn: expiresInSeconds,
    } as SignOptions)
  }

  verify(token: string, secret: string): TokenClaimsInterface {
    try {
      return jwt.verify(token, secret) as TokenClaimsInterface
    } catch {
      throw new InvalidTokenException('Invalid or expired token')
    }
  }

  decode(token: string): DecodedTokenInterface {
    const decoded = jwt.decode(token) as { exp: number }
    const expiresAt = new DateTime(new Date(decoded.exp * 1000))

    return { expiresAt }
  }
}
