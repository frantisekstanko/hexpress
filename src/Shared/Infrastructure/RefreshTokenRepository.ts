import { inject, injectable } from 'inversify'
import { DatabaseContextInterface } from '@/Shared/Application/Database/DatabaseContextInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { ClockInterface } from '@/Shared/Domain/Clock/ClockInterface'
import { DateTime } from '@/Shared/Domain/Clock/DateTime'
import { RefreshTokenRepositoryInterface } from '@/Shared/Domain/RefreshTokenRepositoryInterface'
import { UserId } from '@/Shared/Domain/UserId'

@injectable()
export class RefreshTokenRepository implements RefreshTokenRepositoryInterface {
  constructor(
    @inject(Symbols.DatabaseContextInterface)
    private readonly databaseContext: DatabaseContextInterface,
    @inject(Symbols.ClockInterface)
    private readonly clock: ClockInterface,
  ) {}

  async store(
    token: string,
    userId: UserId,
    expiresAt: DateTime,
  ): Promise<void> {
    const timeNow = this.clock.now()

    await this.databaseContext
      .getCurrentDatabase()
      .query(
        'INSERT INTO refresh_tokens (token, userId, created_at, expires_at) VALUES (?, ?, ?, ?)',
        [
          token,
          userId.toString(),
          timeNow.toUnixtime(),
          expiresAt.toUnixtime(),
        ],
      )
  }

  async exists(token: string): Promise<boolean> {
    const result = await this.databaseContext
      .getCurrentDatabase()
      .query(
        'SELECT 1 FROM refresh_tokens WHERE token = ? AND expires_at > ?',
        [token, this.clock.now().toUnixtime()],
      )

    if (result.length === 0) {
      return false
    }

    return true
  }

  async revoke(token: string): Promise<void> {
    await this.databaseContext
      .getCurrentDatabase()
      .query('DELETE FROM refresh_tokens WHERE token = ?', [token])
  }
}
