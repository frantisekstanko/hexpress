import { EventRecording } from '@/Core/Domain/Event/EventRecording'
import { UserId } from '@/Core/Domain/UserId'
import { HashedPassword } from '@/User/Domain/HashedPassword'
import { Username } from '@/User/Domain/Username'
import { UserWasCreated } from '@/User/Domain/UserWasCreated'

export class User extends EventRecording {
  private userId: UserId
  private username: Username
  private hashedPassword: HashedPassword

  private constructor(args: {
    userId: UserId
    username: Username
    hashedPassword: HashedPassword
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
    username: Username
    hashedPassword: HashedPassword
  }): User {
    const user = new User({ userId: userId, username, hashedPassword })
    user.recordEvent(new UserWasCreated({ userId: userId, username }))
    return user
  }

  public static fromPersistence({
    userId,
    username,
    hashedPassword,
  }: {
    userId: string
    username: string
    hashedPassword: string
  }): User {
    return new User({
      userId: UserId.fromString(userId),
      username: Username.fromString(username),
      hashedPassword: HashedPassword.fromString(hashedPassword),
    })
  }

  public getUserId(): UserId {
    return this.userId
  }

  public getUsername(): Username {
    return this.username
  }

  public getPasswordHash(): HashedPassword {
    return this.hashedPassword
  }
}
