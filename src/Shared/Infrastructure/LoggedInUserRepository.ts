import { LoggedInUser } from '@/Shared/Application/LoggedInUser/LoggedInUser'
import { LoggedInUserRepositoryInterface } from '@/Shared/Application/LoggedInUser/LoggedInUserRepositoryInterface'

export class LoggedInUserRepository implements LoggedInUserRepositoryInterface {
  constructor(private readonly loggedInUser: LoggedInUser) {}

  public getLoggedInUser(): LoggedInUser {
    return this.loggedInUser
  }
}
