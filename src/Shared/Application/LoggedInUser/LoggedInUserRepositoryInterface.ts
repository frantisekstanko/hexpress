import { LoggedInUser } from '@/Shared/Application/LoggedInUser/LoggedInUser'

export interface LoggedInUserRepositoryInterface {
  getLoggedInUser(): LoggedInUser
}
