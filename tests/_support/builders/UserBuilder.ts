import { UserId } from '@/Shared/Domain/UserId'
import { User } from '@/User/Domain/User'

export class UserBuilder {
  public static create(params: {
    userId: string
    username: string
    password: string
  }): User {
    return User.create({
      userId: UserId.fromString(params.userId),
      username: params.username,
      password: params.password,
    })
  }
}
