import { inject, injectable } from 'inversify'
import { CommandHandlerInterface } from '@/Core/Application/Command/CommandHandlerInterface'
import { UserId } from '@/Core/Domain/UserId'
import { CreateUser } from '@/User/Application/CreateUser'
import { UserService } from '@/User/Application/UserService'

@injectable()
export class CreateUserCommandHandler
  implements CommandHandlerInterface<UserId>
{
  constructor(
    @inject(UserService)
    private readonly userService: UserService,
  ) {}

  public async handle(command: CreateUser): Promise<UserId> {
    return await this.userService.createUser(command)
  }
}
