import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { LoginService } from '@/Authentication/Application/LoginService'
import { ControllerInterface } from '@/Shared/Application/Controller/ControllerInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { Assertion } from '@/Shared/Domain/Assert/Assertion'
import { UserId } from '@/Shared/Domain/UserId'
import { ErrorResponse } from '@/Shared/Infrastructure/ErrorResponse'

@injectable()
export class RefreshTokenController implements ControllerInterface {
  constructor(
    @inject(Symbols.LoginService)
    private readonly loginService: LoginService,
  ) {}

  public async handle(request: Request, response: Response): Promise<void> {
    try {
      Assertion.object(request.body)
      Assertion.string(request.body.refreshToken)
    } catch {
      response.status(400).json(
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
      response.status(401).json(
        new ErrorResponse({
          error: 'Invalid or expired refresh token',
        }).toJSON(),
      )
    }
  }
}
