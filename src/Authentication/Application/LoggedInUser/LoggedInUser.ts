import { UserId } from '@/Core/Domain/UserId'

export class LoggedInUser {
  constructor(private readonly userId: UserId) {}

  getUserId(): UserId {
    return this.userId
  }
}
