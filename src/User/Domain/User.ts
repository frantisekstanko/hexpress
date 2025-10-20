import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { EventRecording } from '@/Core/Domain/Event/EventRecording'
import { UserId } from '@/Core/Domain/UserId'
import { UserWasCreated } from '@/User/Domain/UserWasCreated'

export class User extends EventRecording {
  private userId: UserId
  private username: string
  private hashedPassword: string

  private constructor(args: {
    userId: UserId
    username: string
    hashedPassword: string
  }) {
    super()
    this.userId = args.userId
    this.username = args.username
    this.hashedPassword = args.hashedPassword
  }

  public static create({
    userId,
    username,
    hashedPassword,
  }: {
    userId: UserId
    username: string
    hashedPassword: string
  }): User {
    const user = new User({ userId: userId, username, hashedPassword })
    user.recordEvent(new UserWasCreated({ userId: userId, username }))
    return user
  }

  public static fromStorage(row: unknown): User {
    Assertion.object(row, 'Row must be an object')
    Assertion.string(row.userId, 'userId must be a string')
    Assertion.string(row.username, 'username must be a string')
    Assertion.string(row.password, 'password must be a string')

    return new User({
      userId: UserId.fromString(row.userId),
      username: row.username,
      hashedPassword: row.password,
    })
  }

  public toStorage(): {
    userId: string
    username: string
    password: string
  } {
    return {
      userId: this.userId.toString(),
      username: this.username,
      password: this.hashedPassword,
    }
  }

  public getUserId(): UserId {
    return this.userId
  }

  public getPasswordHash(): string {
    return this.hashedPassword
  }
}
