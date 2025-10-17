import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'inversify'
import { AuthenticatedUser } from '@/Authentication/Application/AuthenticatedUser'
import { LoginService } from '@/Authentication/Application/LoginService'
import { AuthenticatedRequest } from '@/Authentication/Infrastructure/AuthenticatedRequest'
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

  public authenticate(
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    try {
      const authorizationHeader = request.headers.authorization

      if (!authorizationHeader) {
        response
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: 'Unauthorized' })
        return
      }

      const matches = /Bearer\s(\S+)/.exec(authorizationHeader)
      if (!matches) {
        response
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: 'Unauthorized' })
        return
      }

      const token = matches[1]

      try {
        const payload = this.loginService.verifyAccessToken(token)
        const userId = UserId.fromString(payload.userId)

        const authenticatedUser = new AuthenticatedUser(userId)

        response.locals.authenticatedUser = authenticatedUser
        ;(request as AuthenticatedRequest).locals = { authenticatedUser }

        next()
      } catch {
        response
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: 'Unauthorized' })
      }
    } catch (error) {
      this.logger.error('Authentication error:', error)
      response
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal server error' })
    }
  }
}
