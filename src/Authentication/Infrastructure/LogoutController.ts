import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { TokenService } from '@/Authentication/Application/TokenService'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { ErrorResponse } from '@/Core/Infrastructure/ErrorResponse'

export class LogoutController implements ControllerInterface {
  constructor(private readonly tokenService: TokenService) {}

  public async handle(request: Request, response: Response): Promise<void> {
    try {
      Assertion.object(request.body)
      Assertion.string(request.body.refreshToken)
    } catch {
      response.status(StatusCodes.BAD_REQUEST).json(
        new ErrorResponse({
          error: 'Invalid request body',
        }).toJSON(),
      )
      return
    }

    try {
      await this.tokenService.revokeRefreshToken(request.body.refreshToken)
    } catch {
      response.status(StatusCodes.UNAUTHORIZED).json(
        new ErrorResponse({
          error: 'Invalid or expired refresh token',
        }).toJSON(),
      )
      return
    }

    response.json({ message: 'Logged out successfully' })
  }
}
