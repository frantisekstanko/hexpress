import { CommandHandlerInterface } from '@/Shared/Application/Command/CommandHandlerInterface'
import { CommandInterface } from '@/Shared/Application/Command/CommandInterface'
import { ConstructorType } from '@/Shared/Application/ConstructorType'

export interface CommandHandlerRegistryInterface {
  register<Result>(
    commandClass: ConstructorType<CommandInterface>,
    handler: CommandHandlerInterface<Result>,
  ): void

  getHandler<Result>(command: CommandInterface): CommandHandlerInterface<Result>
}
