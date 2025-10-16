import { inject, injectable } from 'inversify'
import { CommandBusInterface } from '@/Shared/Application/Command/CommandBusInterface'
import { CommandHandlerRegistryInterface } from '@/Shared/Application/Command/CommandHandlerRegistryInterface'
import { CommandInterface } from '@/Shared/Application/Command/CommandInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { TransactionalExecutorInterface } from '@/Shared/Application/TransactionalExecutorInterface'

@injectable()
export class CommandBus implements CommandBusInterface {
  constructor(
    @inject(Symbols.CommandHandlerRegistryInterface)
    private readonly commandHandlerRegistry: CommandHandlerRegistryInterface,
    @inject(Symbols.TransactionalExecutorInterface)
    private readonly transactionalExecutor: TransactionalExecutorInterface,
  ) {}

  public async dispatch<Result>(command: CommandInterface): Promise<Result> {
    const commandHandler = this.commandHandlerRegistry.getHandler<
      typeof command,
      Result
    >(command)

    return await this.transactionalExecutor.execute(async () => {
      return await commandHandler.handle(command)
    })
  }
}
