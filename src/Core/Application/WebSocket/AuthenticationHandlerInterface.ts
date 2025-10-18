import { AuthenticatedUser } from '@/Authentication/Application/AuthenticatedUser'

export interface AuthenticationHandlerInterface {
  authenticateFromMessage(data: object): AuthenticatedUser
}
