import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { DatabaseRecordInterface } from '@/Core/Application/Database/DatabaseRecordInterface'
import { UserId } from '@/Core/Domain/UserId'
import { DatabaseRowMapper } from '@/Core/Infrastructure/DatabaseRowMapper'
import { User } from '@/User/Domain/User'
import { UserNotFoundException } from '@/User/Domain/UserNotFoundException'
import { Username } from '@/User/Domain/Username'
import { UserRepositoryInterface } from '@/User/Domain/UserRepositoryInterface'
import { TableNames } from '@/User/Infrastructure/TableNames'

export class UserRepository implements UserRepositoryInterface {
  constructor(private readonly databaseContext: DatabaseContextInterface) {}

  async getById(userId: UserId): Promise<User> {
    const rows = await this.databaseContext.getDatabase().query(
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

  async getByUsername(username: Username): Promise<User> {
    const rows = await this.databaseContext.getDatabase().query(
      `SELECT userId, username, password
       FROM ${TableNames.USERS}
       WHERE username = ?`,
      [username.toString()],
    )

    if (rows.length === 0) {
      throw new UserNotFoundException(
        `User with username ${username.toString()} not found`,
      )
    }

    return this.mapRowToUser(rows[0])
  }

  async save(user: User): Promise<void> {
    await this.databaseContext.getDatabase().query(
      `INSERT INTO ${TableNames.USERS} (
        userId, username, password
      ) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
        username = values(username),
        password = values(password)`,
      [
        user.getUserId().toString(),
        user.getUsername().toString(),
        user.getPasswordHash().toString(),
      ],
    )
  }

  private mapRowToUser(row: DatabaseRecordInterface): User {
    return User.fromPersistence({
      userId: DatabaseRowMapper.extractString(row, 'userId'),
      username: DatabaseRowMapper.extractString(row, 'username'),
      hashedPassword: DatabaseRowMapper.extractString(row, 'password'),
    })
  }
}
