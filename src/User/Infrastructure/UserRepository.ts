import { inject, injectable } from 'inversify'
import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { Services } from '@/Core/Application/Services'
import { UserId } from '@/Core/Domain/UserId'
import { User } from '@/User/Domain/User'
import { UserNotFoundException } from '@/User/Domain/UserNotFoundException'
import { UserRepositoryInterface } from '@/User/Domain/UserRepositoryInterface'
import { TableNames } from '@/User/Infrastructure/TableNames'

@injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @inject(Services.DatabaseContextInterface)
    private readonly databaseContext: DatabaseContextInterface,
  ) {}

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

    return User.fromStorage(rows[0])
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

    return User.fromStorage(rows[0])
  }

  async save(user: User): Promise<void> {
    const userData = user.toStorage()

    await this.databaseContext.getCurrentDatabase().query(
      `INSERT INTO ${TableNames.USERS} (
        userId, username, password
      ) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
        username = values(username),
        password = values(password)`,
      [userData.userId, userData.username, userData.password],
    )
  }
}
