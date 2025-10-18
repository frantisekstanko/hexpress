import { DateTimeInterface } from '@/Core/Domain/Clock/DateTimeInterface'
import { UserId } from '@/Core/Domain/UserId'

export interface RefreshTokenRepositoryInterface {
  store(
    token: string,
    userId: UserId,
    expiresAt: DateTimeInterface,
  ): Promise<void>
  exists(token: string): Promise<boolean>
  revoke(token: string): Promise<void>
}
