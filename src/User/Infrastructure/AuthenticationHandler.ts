import { AuthenticationHandlerInterface } from '@/Core/Application/WebSocket/AuthenticationHandlerInterface'
import { AuthenticatedUser } from '@/Core/Domain/AuthenticatedUser'
import { UserId } from '@/Core/Domain/UserId'
import { TokenService } from '@/User/Application/TokenService'
import { InvalidTokenException } from '@/User/Domain/InvalidTokenException'

export class AuthenticationHandler implements AuthenticationHandlerInterface {
  constructor(private readonly tokenService: TokenService) {}

  authenticateFromMessage(data: object): AuthenticatedUser {
    if (
      !('type' in data) ||
      !('token' in data) ||
      typeof data.token !== 'string'
    ) {
      throw new InvalidTokenException('Invalid authentication message format')
    }

    const payload = this.tokenService.verifyAccessToken(data.token)
    const userId = UserId.fromString(payload.userId)

    return new AuthenticatedUser(userId)
  }
}
