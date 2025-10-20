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
      username,
      hashedPassword: hashedPassword,
    })
  }

  public getUserId(): UserId {
    return this.userId
  }

  public getUsername(): string {
    return this.username
  }

  public getPasswordHash(): string {
    return this.hashedPassword
  }
}
