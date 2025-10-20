import { CommandHandlerInterface } from '@/Core/Application/Command/CommandHandlerInterface'
import { CommandHandlerRegistryInterface } from '@/Core/Application/Command/CommandHandlerRegistryInterface'
import { CommandInterface } from '@/Core/Application/Command/CommandInterface'
import { Constructor } from '@/Core/Application/Constructor'

export class CommandHandlerRegistry implements CommandHandlerRegistryInterface {
  private handlers = new Map<
    Constructor<unknown>,
    CommandHandlerInterface<unknown>
  >()

  public register<Result>(
    commandClass: Constructor<CommandInterface>,
    handler: CommandHandlerInterface<Result>,
  ): void {
    this.handlers.set(commandClass, handler as CommandHandlerInterface<unknown>)
  }

  public getHandler<Result>(
    command: CommandInterface,
  ): CommandHandlerInterface<Result> {
    const commandConstructor = (command as object)
      .constructor as Constructor<unknown>
    const handler = this.handlers.get(commandConstructor)

    if (!handler) {
      throw new Error(
        `No handler registered for command: ${commandConstructor.name}`,
      )
    }

    return handler as CommandHandlerInterface<Result>
  }
}
