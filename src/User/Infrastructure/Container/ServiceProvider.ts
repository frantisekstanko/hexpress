import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'
import { CreateUserCommandHandler } from '@/User/Application/CreateUserCommandHandler'
import { Symbols as UserSymbols } from '@/User/Application/Symbols'
import { UserService } from '@/User/Application/UserService'
import { CommandHandlerRegistry } from '@/User/Infrastructure/Container/CommandHandlerRegistry'
import { CreateUserController } from '@/User/Infrastructure/CreateUserController'
import { PasswordHasher } from '@/User/Infrastructure/PasswordHasher'
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

  register(container: ContainerInterface): void {
    container.registerSingleton(
      UserSymbols.PasswordHasherInterface,
      PasswordHasher,
    )

    container.registerSingletonToSelf(UserService)

    container.registerSingletonToSelf(CreateUserCommandHandler)

    container.registerSingleton(
      UserSymbols.UserRepositoryInterface,
      UserRepository,
    )

    container.registerTransient(
      Symbol.for(CreateUserController.name),
      CreateUserController,
    )

    CommandHandlerRegistry.register(container)
  }
}
