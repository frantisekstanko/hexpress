import { UserId } from '@/Core/Domain/UserId'

export class AuthenticatedUser {
  constructor(private readonly userId: UserId) {}

  getUserId(): UserId {
    return this.userId
  }
}
