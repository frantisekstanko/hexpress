import { inject, injectable } from 'inversify'
import { LoginService } from '@/Authentication/Application/LoginService'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { Symbols } from '@/Core/Application/Symbols'
import { WebSocketTokenValidatorInterface } from '@/Core/Application/WebSocket/WebSocketTokenValidatorInterface'

@injectable()
export class WebSocketTokenValidator
  implements WebSocketTokenValidatorInterface
{
  constructor(
    @inject(LoginService)
    private readonly loginService: LoginService,
    @inject(Symbols.LoggerInterface)
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
