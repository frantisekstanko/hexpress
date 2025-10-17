import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { LoginService } from '@/Authentication/Application/LoginService'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { ErrorResponse } from '@/Core/Infrastructure/ErrorResponse'

@injectable()
export class LogoutController implements ControllerInterface {
  constructor(
    @inject(LoginService)
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

    await this.loginService.revokeRefreshToken(request.body.refreshToken)

    response.json({ message: 'Logged out successfully' })
  }
}
