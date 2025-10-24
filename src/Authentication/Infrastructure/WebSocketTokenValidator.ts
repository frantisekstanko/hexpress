import { TokenService } from '@/Authentication/Application/TokenService'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { WebSocketTokenValidatorInterface } from '@/Core/Application/WebSocket/WebSocketTokenValidatorInterface'

export class WebSocketTokenValidator
  implements WebSocketTokenValidatorInterface
{
  constructor(
    private readonly tokenService: TokenService,
    private readonly logger: LoggerInterface,
  ) {}

  public isTokenValid(token: string): boolean {
    try {
      this.tokenService.verifyAccessToken(token)
      return true
    } catch (error) {
      this.logger.error('Error during token validation:', error)
      return false
    }
  }
}
