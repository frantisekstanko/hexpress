import { Assertion } from '@frantisekstanko/assertion'
import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { DatabaseRecordInterface } from '@/Core/Application/Database/DatabaseRecordInterface'
import { UserId } from '@/Core/Domain/UserId'
import { User } from '@/User/Domain/User'
import { UserNotFoundException } from '@/User/Domain/UserNotFoundException'
import { UserRepositoryInterface } from '@/User/Domain/UserRepositoryInterface'
import { TableNames } from '@/User/Infrastructure/TableNames'

export class UserRepository implements UserRepositoryInterface {
  constructor(private readonly databaseContext: DatabaseContextInterface) {}

  async getById(userId: UserId): Promise<User> {
    const rows = await this.databaseContext.getCurrentDatabase().query(
      `SELECT userId, username, password
       FROM ${TableNames.USERS}
       WHERE userId = ?`,
      [userId.toString()],
    )

    if (rows.length === 0) {
      throw new UserNotFoundException(
        `User with id ${userId.toString()} not found`,
      )
    }

    return this.mapRowToUser(rows[0])
  }

  async getByUsername(username: string): Promise<User> {
    const rows = await this.databaseContext.getCurrentDatabase().query(
      `SELECT userId, username, password
       FROM ${TableNames.USERS}
       WHERE username = ?`,
      [username],
    )

    if (rows.length === 0) {
      throw new UserNotFoundException(
        `User with username ${username} not found`,
      )
    }

    return this.mapRowToUser(rows[0])
  }

  async save(user: User): Promise<void> {
    await this.databaseContext.getCurrentDatabase().query(
      `INSERT INTO ${TableNames.USERS} (
        userId, username, password
      ) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
        username = values(username),
        password = values(password)`,
      [user.getUserId().toString(), user.getUsername(), user.getPasswordHash()],
    )
  }

  private mapRowToUser(row: DatabaseRecordInterface): User {
    Assertion.string(row.userId)
    Assertion.string(row.username)
    Assertion.string(row.password)

    return User.fromPersistence({
      userId: row.userId,
      username: row.username,
      hashedPassword: row.password,
    })
  }
}
