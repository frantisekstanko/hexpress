import { CommandHandlerInterface } from '@/Core/Application/Command/CommandHandlerInterface'
import { CommandInterface } from '@/Core/Application/Command/CommandInterface'
import { ConstructorType } from '@/Core/Application/ConstructorType'

export interface CommandHandlerRegistryInterface {
  register<Result>(
    commandClass: ConstructorType<CommandInterface>,
    handler: CommandHandlerInterface<Result>,
  ): void

  getHandler<Result>(command: CommandInterface): CommandHandlerInterface<Result>
}
