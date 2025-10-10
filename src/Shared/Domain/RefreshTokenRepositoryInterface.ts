import { DateTime } from '@/Shared/Domain/Clock/DateTime.js'
import { UserId } from '@/Shared/Domain/UserId'

export interface RefreshTokenRepositoryInterface {
  store(token: string, userId: UserId, expiresAt: DateTime): Promise<void>
  exists(token: string): Promise<boolean>
  revoke(token: string): Promise<void>
}
