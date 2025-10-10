import { CommandHandlerInterface } from '@/Shared/Application/Command/CommandHandlerInterface'
import { ConstructorType } from '@/Shared/Application/ConstructorType'

export interface CommandHandlerRegistryInterface {
  register<Command, Result>(
    commandClass: ConstructorType<Command>,
    handler: CommandHandlerInterface<Command, Result>,
  ): void

  getHandler<Command, Result>(
    command: Command,
  ): CommandHandlerInterface<Command, Result>
}
