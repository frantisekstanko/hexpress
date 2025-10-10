import { Request, Response } from 'express'
import { inject } from 'inversify'
import { ControllerInterface } from '@/Shared/Application/Controller/ControllerInterface'
import { LoginService } from '@/Shared/Application/LoginService'
import { Symbols } from '@/Shared/Application/Symbols'
import { Assertion } from '@/Shared/Domain/Assert/Assertion'
import { AssertionFailedException } from '@/Shared/Domain/Assert/AssertionFailedException'
import { ErrorResponse } from '@/Shared/Infrastructure/ErrorResponse'
import { UserService } from '@/User/Application/UserService'
import { UserNotFoundException } from '@/User/Domain/UserNotFoundException'

export class LoginController implements ControllerInterface {
  constructor(
    @inject(Symbols.UserService)
    private readonly userService: UserService,
    @inject(Symbols.LoginService)
    private readonly loginService: LoginService,
  ) {}

  public async handle(request: Request, response: Response): Promise<void> {
    try {
      Assertion.object(request.body, 'Invalid request')
      Assertion.string(request.body.username, 'Username is required')
      Assertion.string(request.body.password, 'Password is required')

      const userId = await this.userService.authenticateUser(
        request.body.username,
        request.body.password,
      )

      const tokens = await this.loginService.generateTokenPair(userId)

      response.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      })
    } catch (error: unknown) {
      if (error instanceof AssertionFailedException) {
        response
          .status(400)
          .json(new ErrorResponse({ error: error.message }).toJSON())
        return
      }

      if (
        error instanceof UserNotFoundException ||
        (error instanceof Error && error.message === 'Invalid credentials')
      ) {
        response
          .status(401)
          .json(new ErrorResponse({ error: 'Invalid credentials' }).toJSON())
        return
      }

      throw error
    }
  }
}
