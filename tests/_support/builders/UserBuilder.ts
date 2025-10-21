import { UserId } from '@/Core/Domain/UserId'
import { HashedPassword } from '@/User/Domain/HashedPassword'
import { User } from '@/User/Domain/User'
import { Username } from '@/User/Domain/Username'

export class UserBuilder {
  public static create(params: {
    userId: string
    username: string
    hashedPassword: string
  }): User {
    return User.create({
      userId: UserId.fromString(params.userId),
      username: Username.fromString(params.username),
      hashedPassword: HashedPassword.fromString(params.hashedPassword),
    })
  }
}
