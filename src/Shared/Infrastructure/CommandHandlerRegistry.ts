import { injectable } from 'inversify'
import { CommandHandlerInterface } from '@/Shared/Application/Command/CommandHandlerInterface'
import { CommandHandlerRegistryInterface } from '@/Shared/Application/Command/CommandHandlerRegistryInterface'
import { CommandInterface } from '@/Shared/Application/Command/CommandInterface'
import { ConstructorType } from '@/Shared/Application/ConstructorType'

@injectable()
export class CommandHandlerRegistry implements CommandHandlerRegistryInterface {
  private handlers = new Map<
    ConstructorType<unknown>,
    CommandHandlerInterface<unknown>
  >()

  public register<Result>(
    commandClass: ConstructorType<CommandInterface>,
    handler: CommandHandlerInterface<Result>,
  ): void {
    this.handlers.set(commandClass, handler as CommandHandlerInterface<unknown>)
  }

  public getHandler<Result>(
    command: CommandInterface,
  ): CommandHandlerInterface<Result> {
    const commandConstructor = (command as object)
      .constructor as ConstructorType<unknown>
    const handler = this.handlers.get(commandConstructor)

    if (!handler) {
      throw new Error(
        `No handler registered for command: ${commandConstructor.name}`,
      )
    }

    return handler as CommandHandlerInterface<Result>
  }
}
