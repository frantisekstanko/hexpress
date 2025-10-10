import { injectable } from 'inversify'
import { CommandHandlerInterface } from '@/Shared/Application/Command/CommandHandlerInterface'
import { CommandHandlerRegistryInterface } from '@/Shared/Application/Command/CommandHandlerRegistryInterface'
import { ConstructorType } from '@/Shared/Application/ConstructorType'

@injectable()
export class CommandHandlerRegistry implements CommandHandlerRegistryInterface {
  private handlers = new Map<
    ConstructorType<unknown>,
    CommandHandlerInterface<unknown, unknown>
  >()

  public register<Command, Result>(
    commandClass: ConstructorType<Command>,
    handler: CommandHandlerInterface<Command, Result>,
  ): void {
    this.handlers.set(
      commandClass,
      handler as CommandHandlerInterface<unknown, unknown>,
    )
  }

  public getHandler<Command, Result>(
    command: Command,
  ): CommandHandlerInterface<Command, Result> {
    const commandConstructor = (command as object)
      .constructor as ConstructorType<unknown>
    const handler = this.handlers.get(commandConstructor)

    if (!handler) {
      throw new Error(
        `No handler registered for command: ${commandConstructor.name}`,
      )
    }

    return handler as CommandHandlerInterface<Command, Result>
  }
}
