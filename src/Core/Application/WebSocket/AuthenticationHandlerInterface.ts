import { AuthenticatedUser } from '@/Core/Domain/AuthenticatedUser'

export interface AuthenticationHandlerInterface {
  authenticateFromMessage(data: object): AuthenticatedUser
}
