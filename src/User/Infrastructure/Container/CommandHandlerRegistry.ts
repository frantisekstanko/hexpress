import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { Services } from '@/Core/Application/Services'
import { CreateUser } from '@/User/Application/CreateUser'
import { CreateUserCommandHandler } from '@/User/Application/CreateUserCommandHandler'

export class CommandHandlerRegistry {
  static register(container: ContainerInterface): void {
    const commandHandlerRegistry = container.get(
      Services.CommandHandlerRegistryInterface,
    )

    const createUserCommandHandler = container.get(CreateUserCommandHandler)

    commandHandlerRegistry.register(CreateUser, createUserCommandHandler)
  }
}
