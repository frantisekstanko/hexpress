import { Request } from 'express'
import { LoggedInUserRepositoryInterface } from '@/Authentication/Application/LoggedInUser/LoggedInUserRepositoryInterface'

export interface AuthenticatedRequest extends Request {
  locals: {
    loggedInUserRepository: LoggedInUserRepositoryInterface
  }
}
