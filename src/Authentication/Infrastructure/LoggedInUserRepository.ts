import { LoggedInUser } from '@/Authentication/Application/LoggedInUser/LoggedInUser'
import { LoggedInUserRepositoryInterface } from '@/Authentication/Application/LoggedInUser/LoggedInUserRepositoryInterface'

export class LoggedInUserRepository implements LoggedInUserRepositoryInterface {
  constructor(private readonly loggedInUser: LoggedInUser) {}

  public getLoggedInUser(): LoggedInUser {
    return this.loggedInUser
  }
}
