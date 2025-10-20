import { RefreshTokenRepositoryInterface } from '@/Authentication/Domain/RefreshTokenRepositoryInterface'
import { TableNames } from '@/Authentication/Infrastructure/TableNames'
import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { ClockInterface } from '@/Core/Domain/Clock/ClockInterface'
import { DateTime } from '@/Core/Domain/Clock/DateTime'
import { UserId } from '@/Core/Domain/UserId'

export class RefreshTokenRepository implements RefreshTokenRepositoryInterface {
  constructor(
    private readonly databaseContext: DatabaseContextInterface,
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
        `INSERT INTO ${TableNames.REFRESH_TOKENS} (token, userId, created_at, expires_at) VALUES (?, ?, ?, ?)`,
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
        `SELECT 1 FROM ${TableNames.REFRESH_TOKENS} WHERE token = ? AND expires_at > ?`,
        [token, this.clock.now().toUnixtime()],
      )

    return result.length > 0
  }

  async revoke(token: string): Promise<void> {
    await this.databaseContext
      .getCurrentDatabase()
      .query(`DELETE FROM ${TableNames.REFRESH_TOKENS} WHERE token = ?`, [
        token,
      ])
  }
}
