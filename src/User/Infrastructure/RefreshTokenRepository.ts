import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { ClockInterface } from '@/Core/Domain/Clock/ClockInterface'
import { DateTime } from '@/Core/Domain/Clock/DateTime'
import { UserId } from '@/Core/Domain/UserId'
import { JwtId } from '@/User/Domain/JwtId'
import { RefreshTokenRepositoryInterface } from '@/User/Domain/RefreshTokenRepositoryInterface'
import { TableNames } from '@/User/Infrastructure/TableNames'

export class RefreshTokenRepository implements RefreshTokenRepositoryInterface {
  constructor(
    private readonly databaseContext: DatabaseContextInterface,
    private readonly clock: ClockInterface,
  ) {}

  async store(jti: JwtId, userId: UserId, expiresAt: DateTime): Promise<void> {
    const timeNow = this.clock.now()

    await this.databaseContext
      .getDatabase()
      .query(
        `INSERT INTO ${TableNames.REFRESH_TOKENS} (jti, userId, created_at, expires_at) VALUES (?, ?, ?, ?)`,
        [
          jti.toString(),
          userId.toString(),
          timeNow.toUnixtime(),
          expiresAt.toUnixtime(),
        ],
      )
  }

  async exists(jti: JwtId): Promise<boolean> {
    const result = await this.databaseContext
      .getDatabase()
      .query(
        `SELECT 1 FROM ${TableNames.REFRESH_TOKENS} WHERE jti = ? AND expires_at > ?`,
        [jti.toString(), this.clock.now().toUnixtime()],
      )

    return result.length > 0
  }

  async revoke(jti: JwtId): Promise<void> {
    await this.databaseContext
      .getDatabase()
      .query(`DELETE FROM ${TableNames.REFRESH_TOKENS} WHERE jti = ?`, [
        jti.toString(),
      ])
  }
}
