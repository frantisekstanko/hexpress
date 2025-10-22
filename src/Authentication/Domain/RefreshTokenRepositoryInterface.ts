import { JwtId } from '@/Authentication/Domain/JwtId'
import { DateTimeInterface } from '@/Core/Domain/Clock/DateTimeInterface'
import { UserId } from '@/Core/Domain/UserId'

export interface RefreshTokenRepositoryInterface {
  store(jti: JwtId, userId: UserId, expiresAt: DateTimeInterface): Promise<void>
  exists(jti: JwtId): Promise<boolean>
  revoke(jti: JwtId): Promise<void>
}
