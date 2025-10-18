import { inject, injectable } from 'inversify'
import { AuthenticatedUser } from '@/Authentication/Application/AuthenticatedUser'
import { LoginService } from '@/Authentication/Application/LoginService'
import { InvalidTokenException } from '@/Authentication/Domain/InvalidTokenException'
import { AuthenticationHandlerInterface } from '@/Core/Application/WebSocket/AuthenticationHandlerInterface'
import { UserId } from '@/Core/Domain/UserId'

@injectable()
export class AuthenticationHandler implements AuthenticationHandlerInterface {
  constructor(
    @inject(LoginService)
    private readonly loginService: LoginService,
  ) {}

  authenticateFromMessage(data: object): AuthenticatedUser {
    if (
      !('type' in data) ||
      !('token' in data) ||
      typeof data.token !== 'string'
    ) {
      throw new InvalidTokenException('Invalid authentication message format')
    }

    const payload = this.loginService.verifyAccessToken(data.token)
    const userId = UserId.fromString(payload.userId)

    return new AuthenticatedUser(userId)
  }
}
