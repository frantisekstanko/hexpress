import { CommandHandlerInterface } from '@/Core/Application/Command/CommandHandlerInterface'
import { CommandInterface } from '@/Core/Application/Command/CommandInterface'
import { Constructor } from '@/Core/Application/Constructor'

export interface CommandHandlerRegistryInterface {
  register<Result>(
    commandClass: Constructor<CommandInterface>,
    handler: CommandHandlerInterface<Result>,
  ): void

  getHandler<Result>(command: CommandInterface): CommandHandlerInterface<Result>
}
