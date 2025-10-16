import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { CommandBusInterface } from '@/Shared/Application/Command/CommandBusInterface'
import { ControllerInterface } from '@/Shared/Application/Controller/ControllerInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { Assertion } from '@/Shared/Domain/Assert/Assertion'
import { UserId } from '@/Shared/Domain/UserId'
import { ErrorResponse } from '@/Shared/Infrastructure/ErrorResponse'
import { CreateUser } from '@/User/Application/CreateUser'

@injectable()
export class CreateUserController implements ControllerInterface {
  constructor(
    @inject(Symbols.CommandBusInterface)
    private readonly commandBus: CommandBusInterface,
  ) {}

  async handle(request: Request, response: Response): Promise<void> {
    try {
      Assertion.object(request.body, 'Request body is required')
    } catch {
      response
        .status(400)
        .json(new ErrorResponse({ error: 'Request body is required' }).toJSON())
      return
    }

    const username = request.body.username
    const password = request.body.password

    if (!username || typeof username !== 'string') {
      response
        .status(400)
        .json(new ErrorResponse({ error: 'Username is required' }).toJSON())
      return
    }

    if (!password || typeof password !== 'string') {
      response
        .status(400)
        .json(new ErrorResponse({ error: 'Password is required' }).toJSON())
      return
    }

    if (password.length < 8) {
      response.status(400).json(
        new ErrorResponse({
          error: 'Password must be at least 8 characters long',
        }).toJSON(),
      )
      return
    }

    const userId = await this.commandBus.dispatch<UserId>(
      new CreateUser({ username, password }),
    )

    response.status(201).json({ userId: userId.toString() })
  }
}
