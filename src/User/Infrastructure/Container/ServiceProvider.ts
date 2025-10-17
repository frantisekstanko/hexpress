import { Container as InversifyContainer } from 'inversify'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'
import { CreateUserCommandHandler } from '@/User/Application/CreateUserCommandHandler'
import { PasswordHasherInterface } from '@/User/Application/PasswordHasherInterface'
import { Symbols as UserSymbols } from '@/User/Application/Symbols'
import { UserService } from '@/User/Application/UserService'
import { UserRepositoryInterface } from '@/User/Domain/UserRepositoryInterface'
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

  register(container: InversifyContainer): void {
    container
      .bind<PasswordHasherInterface>(UserSymbols.PasswordHasherInterface)
      .to(PasswordHasher)
      .inSingletonScope()

    container.bind<UserService>(UserService).toSelf().inSingletonScope()

    container
      .bind<CreateUserCommandHandler>(CreateUserCommandHandler)
      .toSelf()
      .inSingletonScope()

    container
      .bind<UserRepositoryInterface>(UserSymbols.UserRepositoryInterface)
      .to(UserRepository)
      .inSingletonScope()

    container
      .bind<ControllerInterface>(Symbol.for(CreateUserController.name))
      .to(CreateUserController)

    CommandHandlerRegistry.register(container)
  }
}
