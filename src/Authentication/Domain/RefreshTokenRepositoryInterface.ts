import { DateTime } from '@/Core/Domain/Clock/DateTime.js'
import { UserId } from '@/Core/Domain/UserId'

export interface RefreshTokenRepositoryInterface {
  store(token: string, userId: UserId, expiresAt: DateTime): Promise<void>
  exists(token: string): Promise<boolean>
  revoke(token: string): Promise<void>
}
