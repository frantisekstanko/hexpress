import { LoginService } from '@/Authentication/Application/LoginService'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { WebSocketTokenValidatorInterface } from '@/Core/Application/WebSocket/WebSocketTokenValidatorInterface'

export class WebSocketTokenValidator
  implements WebSocketTokenValidatorInterface
{
  constructor(
    private readonly loginService: LoginService,
    private readonly logger: LoggerInterface,
  ) {}

  public isTokenValid(token: string): boolean {
    try {
      this.loginService.verifyAccessToken(token)
      return true
    } catch (error) {
      this.logger.error('Error during token validation:', error)
      return false
    }
  }
}
