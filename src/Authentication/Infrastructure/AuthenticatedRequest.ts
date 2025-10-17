import { Request } from 'express'
import { AuthenticatedUser } from '@/Authentication/Application/AuthenticatedUser'

export interface AuthenticatedRequest extends Request {
  locals: {
    authenticatedUser: AuthenticatedUser
  }
}
