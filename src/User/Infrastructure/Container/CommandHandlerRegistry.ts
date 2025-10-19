import { CommandHandlerRegistryInterface } from '@/Core/Application/Command/CommandHandlerRegistryInterface'
import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { Symbols as CoreSymbols } from '@/Core/Application/Symbols'
import { CreateUser } from '@/User/Application/CreateUser'
import { CreateUserCommandHandler } from '@/User/Application/CreateUserCommandHandler'

export class CommandHandlerRegistry {
  static register(container: ContainerInterface): void {
    const commandHandlerRegistry =
      container.get<CommandHandlerRegistryInterface>(
        CoreSymbols.CommandHandlerRegistryInterface,
      )

    const createUserCommandHandler = container.get<CreateUserCommandHandler>(
      CreateUserCommandHandler,
    )

    commandHandlerRegistry.register(CreateUser, createUserCommandHandler)
  }
}
