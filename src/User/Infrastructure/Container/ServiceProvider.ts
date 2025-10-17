import { Container as InversifyContainer } from 'inversify'
import { CommandHandlerRegistryInterface } from '@/Core/Application/Command/CommandHandlerRegistryInterface'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'
import { Symbols } from '@/Core/Application/Symbols'
import { CreateUser } from '@/User/Application/CreateUser'
import { CreateUserCommandHandler } from '@/User/Application/CreateUserCommandHandler'
import { PasswordHasherInterface } from '@/User/Application/PasswordHasherInterface'
import { UserService } from '@/User/Application/UserService'
import { UserRepositoryInterface } from '@/User/Domain/UserRepositoryInterface'
import { CreateUserController } from '@/User/Infrastructure/CreateUserController'
import PasswordHasher from '@/User/Infrastructure/PasswordHasher'
import { RouteProvider } from '@/User/Infrastructure/Router/RouteProvider'
import { UserRepository } from '@/User/Infrastructure/UserRepository'

export class ServiceProvider implements ServiceProviderInterface {
  private routeProvider: RouteProvider

  constructor() {
    this.routeProvider = new RouteProvider()
  }

  getRoutes(): RouteConfig[] {
    return this.routeProvider.getRoutes()
  }

  register(container: InversifyContainer): void {
    container
      .bind<PasswordHasherInterface>(Symbols.PasswordHasherInterface)
      .to(PasswordHasher)
      .inSingletonScope()

    container
      .bind<UserService>(Symbols.UserService)
      .to(UserService)
      .inSingletonScope()

    container
      .bind<CreateUserCommandHandler>(CreateUserCommandHandler)
      .toSelf()
      .inSingletonScope()

    container
      .bind<UserRepositoryInterface>(Symbols.UserRepositoryInterface)
      .to(UserRepository)
      .inSingletonScope()

    container
      .bind<ControllerInterface>(Symbol.for(CreateUserController.name))
      .to(CreateUserController)

    const commandHandlerRegistry =
      container.get<CommandHandlerRegistryInterface>(
        Symbols.CommandHandlerRegistryInterface,
      )

    const createUserCommandHandler = container.get<CreateUserCommandHandler>(
      CreateUserCommandHandler,
    )

    commandHandlerRegistry.register(CreateUser, createUserCommandHandler)
  }
}
