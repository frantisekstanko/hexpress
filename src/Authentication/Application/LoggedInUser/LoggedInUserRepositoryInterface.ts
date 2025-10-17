import { LoggedInUser } from '@/Authentication/Application/LoggedInUser/LoggedInUser'

export interface LoggedInUserRepositoryInterface {
  getLoggedInUser(): LoggedInUser
}
