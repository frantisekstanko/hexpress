import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'
import { Services as CoreServices } from '@/Core/Application/Services'
import { CreateUserCommandHandler } from '@/User/Application/CreateUserCommandHandler'
import { Services } from '@/User/Application/Services'
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
      Services.PasswordHasherInterface,
      PasswordHasher,
    )

    container.registerFactory(
      UserService,
      (container) =>
        new UserService(
          container.get(CoreServices.UuidRepositoryInterface),
          container.get(Services.UserRepositoryInterface),
          container.get(Services.PasswordHasherInterface),
          container.get(CoreServices.EventDispatcherInterface),
        ),
    )

    container.registerFactory(
      CreateUserCommandHandler,
      (container) => new CreateUserCommandHandler(container.get(UserService)),
    )

    container.registerSingleton(
      Services.UserRepositoryInterface,
      UserRepository,
    )

    container.registerTransient(
      Symbol.for(CreateUserController.name),
      CreateUserController,
    )

    CommandHandlerRegistry.register(container)
  }
}
