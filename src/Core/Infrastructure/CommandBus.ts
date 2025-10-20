import { CommandBusInterface } from '@/Core/Application/Command/CommandBusInterface'
import { CommandHandlerRegistryInterface } from '@/Core/Application/Command/CommandHandlerRegistryInterface'
import { CommandInterface } from '@/Core/Application/Command/CommandInterface'
import { TransactionalExecutorInterface } from '@/Core/Application/TransactionalExecutorInterface'

export class CommandBus implements CommandBusInterface {
  constructor(
    private readonly commandHandlerRegistry: CommandHandlerRegistryInterface,
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
