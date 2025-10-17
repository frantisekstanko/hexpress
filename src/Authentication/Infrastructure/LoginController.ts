import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject } from 'inversify'
import { LoginService } from '@/Authentication/Application/LoginService'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { AssertionFailedException } from '@/Core/Domain/Assert/AssertionFailedException'
import { ErrorResponse } from '@/Core/Infrastructure/ErrorResponse'
import { UserNotFoundException } from '@/User/Domain/UserNotFoundException'

export class LoginController implements ControllerInterface {
  constructor(
    @inject(LoginService)
    private readonly loginService: LoginService,
  ) {}

  public async handle(request: Request, response: Response): Promise<void> {
    try {
      Assertion.object(request.body, 'Invalid request')
      Assertion.string(request.body.username, 'Username is required')
      Assertion.string(request.body.password, 'Password is required')

      const userId = await this.loginService.authenticateUser(
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
          .status(StatusCodes.BAD_REQUEST)
          .json(new ErrorResponse({ error: error.message }).toJSON())
        return
      }

      if (
        error instanceof UserNotFoundException ||
        (error instanceof Error && error.message === 'Invalid credentials')
      ) {
        response
          .status(StatusCodes.UNAUTHORIZED)
          .json(new ErrorResponse({ error: 'Invalid credentials' }).toJSON())
        return
      }

      throw error
    }
  }
}
