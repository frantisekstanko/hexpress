import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { LoggedInUser } from '@/Authentication/Application/LoggedInUser/LoggedInUser'
import { LoginService } from '@/Authentication/Application/LoginService'
import { AuthenticatedRequest } from '@/Authentication/Infrastructure/AuthenticatedRequest'
import { LoggedInUserRepository } from '@/Authentication/Infrastructure/LoggedInUserRepository'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { Symbols as CoreSymbols } from '@/Core/Application/Symbols'
import { UserId } from '@/Core/Domain/UserId'

@injectable()
export class AuthenticationMiddleware {
  constructor(
    @inject(LoginService)
    private readonly loginService: LoginService,
    @inject(CoreSymbols.LoggerInterface)
    private readonly logger: LoggerInterface,
  ) {}

  public async authenticate(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const authorizationHeader = request.headers.authorization

      if (!authorizationHeader) {
        response.status(401).json({ error: 'Unauthorized' })
        return
      }

      const matches = /Bearer\s(\S+)/.exec(authorizationHeader)
      if (!matches) {
        response.status(401).json({ error: 'Unauthorized' })
        return
      }

      const token = matches[1]

      try {
        const payload = await this.loginService.verifyAccessToken(token)
        const userId = UserId.fromString(payload.userId)

        const loggedInUser = new LoggedInUser(userId)
        const loggedInUserRepository = new LoggedInUserRepository(loggedInUser)

        response.locals.loggedInUserRepository = loggedInUserRepository
        ;(request as AuthenticatedRequest).locals = { loggedInUserRepository }

        next()
      } catch {
        response.status(401).json({ error: 'Unauthorized' })
      }
    } catch (error) {
      this.logger.error('Authentication error:', error)
      response.status(500).json({ error: 'Internal server error' })
    }
  }
}
