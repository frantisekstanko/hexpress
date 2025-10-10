import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { ControllerInterface } from '@/Shared/Application/Controller/ControllerInterface'
import { LoginService } from '@/Shared/Application/LoginService'
import { Symbols } from '@/Shared/Application/Symbols'
import { Assertion } from '@/Shared/Domain/Assert/Assertion'
import { ErrorResponse } from '@/Shared/Infrastructure/ErrorResponse'

@injectable()
export class LogoutController implements ControllerInterface {
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

    await this.loginService.revokeRefreshToken(request.body.refreshToken)

    response.json({ message: 'Logged out successfully' })
  }
}
