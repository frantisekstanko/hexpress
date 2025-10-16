import { inject, injectable } from 'inversify'
import { CommandHandlerInterface } from '@/Shared/Application/Command/CommandHandlerInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { UserId } from '@/Shared/Domain/UserId'
import { CreateUser } from '@/User/Application/CreateUser'
import { UserService } from '@/User/Application/UserService'

@injectable()
export class CreateUserCommandHandler
  implements CommandHandlerInterface<UserId>
{
  constructor(
    @inject(Symbols.UserService)
    private readonly userService: UserService,
  ) {}

  public async handle(command: CreateUser): Promise<UserId> {
    return await this.userService.createUser(command)
  }
}
