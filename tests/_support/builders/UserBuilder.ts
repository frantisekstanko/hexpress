import { UserId } from '@/Core/Domain/UserId'
import { User } from '@/User/Domain/User'

export class UserBuilder {
  public static create(params: {
    userId: string
    username: string
    hashedPassword: string
  }): User {
    return User.create({
      userId: UserId.fromString(params.userId),
      username: params.username,
      hashedPassword: params.hashedPassword,
    })
  }
}
