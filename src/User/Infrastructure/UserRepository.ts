import { inject, injectable } from 'inversify'
import { DatabaseContextInterface } from '@/Shared/Application/Database/DatabaseContextInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { UserId } from '@/Shared/Domain/UserId'
import { User } from '@/User/Domain/User'
import { UserNotFoundException } from '@/User/Domain/UserNotFoundException'
import { UserRepositoryInterface } from '@/User/Domain/UserRepositoryInterface'

@injectable()
export class UserRepository implements UserRepositoryInterface {
  readonly usersTable = 'users'

  constructor(
    @inject(Symbols.DatabaseContextInterface)
    private readonly databaseContext: DatabaseContextInterface,
  ) {}

  async getById(userId: UserId): Promise<User> {
    const row = await this.databaseContext.getCurrentDatabase().queryFirst(
      `SELECT userId, username, password
       FROM ${this.usersTable}
       WHERE userId = ?`,
      [userId.toString()],
    )

    if (row === null) {
      throw new UserNotFoundException(
        `User with id ${userId.toString()} not found`,
      )
    }

    return User.fromStorage(row)
  }

  async getByUsername(username: string): Promise<User> {
    const row = await this.databaseContext.getCurrentDatabase().queryFirst(
      `SELECT userId, username, password
       FROM ${this.usersTable}
       WHERE username = ?`,
      [username],
    )

    if (row === null) {
      throw new UserNotFoundException(
        `User with username ${username} not found`,
      )
    }

    return User.fromStorage(row)
  }

  async save(user: User): Promise<void> {
    const userData = user.toStorage()

    await this.databaseContext.getCurrentDatabase().query(
      `INSERT INTO ${this.usersTable} (
        userId, username, password
      ) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
        username = values(username),
        password = values(password)`,
      [userData.userId, userData.username, userData.password],
    )
  }
}
