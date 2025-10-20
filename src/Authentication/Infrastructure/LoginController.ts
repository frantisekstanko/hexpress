import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { TokenService } from '@/Authentication/Application/TokenService'
import { UserAuthenticationService } from '@/Authentication/Application/UserAuthenticationService'
import { InvalidCredentialsException } from '@/Authentication/Domain/InvalidCredentialsException'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { AssertionFailedException } from '@/Core/Domain/Assert/AssertionFailedException'
import { ErrorResponse } from '@/Core/Infrastructure/ErrorResponse'
import { UserNotFoundException } from '@/User/Domain/UserNotFoundException'

export class LoginController implements ControllerInterface {
  constructor(
    private readonly userAuthenticationService: UserAuthenticationService,
    private readonly tokenService: TokenService,
  ) {}

  public async handle(request: Request, response: Response): Promise<void> {
    try {
      Assertion.object(request.body, 'Invalid request')
      Assertion.string(request.body.username, 'Username is required')
      Assertion.string(request.body.password, 'Password is required')

      const userId = await this.userAuthenticationService.authenticate(
        request.body.username,
        request.body.password,
      )

      const tokens = await this.tokenService.generateTokenPair(userId)

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
        error instanceof InvalidCredentialsException
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
