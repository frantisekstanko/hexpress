import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { LoginService } from '@/Authentication/Application/LoginService'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { UserId } from '@/Core/Domain/UserId'
import { ErrorResponse } from '@/Core/Infrastructure/ErrorResponse'

export class RefreshTokenController implements ControllerInterface {
  constructor(private readonly loginService: LoginService) {}

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

    const refreshToken = request.body.refreshToken

    try {
      const payload = await this.loginService.verifyRefreshToken(refreshToken)
      const userId = UserId.fromString(payload.userId)

      await this.loginService.revokeRefreshToken(refreshToken)

      const tokens = await this.loginService.generateTokenPair(userId)

      response.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      })
    } catch {
      response.status(StatusCodes.UNAUTHORIZED).json(
        new ErrorResponse({
          error: 'Invalid or expired refresh token',
        }).toJSON(),
      )
    }
  }
}
