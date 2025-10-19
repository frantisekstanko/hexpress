import { inject, injectable } from 'inversify'
import { CommandBusInterface } from '@/Core/Application/Command/CommandBusInterface'
import { CommandHandlerRegistryInterface } from '@/Core/Application/Command/CommandHandlerRegistryInterface'
import { CommandInterface } from '@/Core/Application/Command/CommandInterface'
import { Services } from '@/Core/Application/Services'
import { TransactionalExecutorInterface } from '@/Core/Application/TransactionalExecutorInterface'

@injectable()
export class CommandBus implements CommandBusInterface {
  constructor(
    @inject(Services.CommandHandlerRegistryInterface)
    private readonly commandHandlerRegistry: CommandHandlerRegistryInterface,
    @inject(Services.TransactionalExecutorInterface)
    private readonly transactionalExecutor: TransactionalExecutorInterface,
  ) {}

  public async dispatch<Result>(command: CommandInterface): Promise<Result> {
    const commandHandler =
      this.commandHandlerRegistry.getHandler<Result>(command)

    return await this.transactionalExecutor.execute(async () => {
      return await commandHandler.handle(command)
    })
  }
}
