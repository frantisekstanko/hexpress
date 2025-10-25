import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { UserId } from '@/Core/Domain/UserId'
import { ErrorResponse } from '@/Core/Infrastructure/ErrorResponse'
import { TokenService } from '@/User/Application/TokenService'

export class RefreshTokenController implements ControllerInterface {
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

    const refreshToken = request.body.refreshToken

    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken)
      const userId = UserId.fromString(payload.userId)

      await this.tokenService.revokeRefreshToken(refreshToken)

      const tokens = await this.tokenService.generateTokenPair(userId)

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
