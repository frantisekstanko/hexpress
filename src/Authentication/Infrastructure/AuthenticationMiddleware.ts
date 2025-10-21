import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { AuthenticatedHttpRequest } from '@/Authentication/Application/AuthenticatedHttpRequest'
import { AuthenticatedUser } from '@/Authentication/Application/AuthenticatedUser'
import { TokenService } from '@/Authentication/Application/TokenService'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { UserId } from '@/Core/Domain/UserId'

export class AuthenticationMiddleware {
  constructor(
    private readonly tokenService: TokenService,
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
        const payload = this.tokenService.verifyAccessToken(token)
        const userId = UserId.fromString(payload.userId)

        const authenticatedUser = new AuthenticatedUser(userId)

        response.locals.authenticatedUser = authenticatedUser
        ;(request as unknown as AuthenticatedHttpRequest).locals = {
          authenticatedUser,
        }

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
