import { Request } from 'express'
import { LoggedInUserRepositoryInterface } from '@/Shared/Application/LoggedInUser/LoggedInUserRepositoryInterface'

export interface AuthenticatedRequest extends Request {
  locals: {
    loggedInUserRepository: LoggedInUserRepositoryInterface
  }
}
