import { Container as InversifyContainer } from 'inversify'
import { ApplicationFactoryInterface } from '@/Shared/Application/ApplicationFactoryInterface'
import { ApplicationVersionRepositoryInterface } from '@/Shared/Application/ApplicationVersionRepositoryInterface'
import { ConfigInterface } from '@/Shared/Application/Config/ConfigInterface'
import { ControllerInterface } from '@/Shared/Application/Controller/ControllerInterface'
import { DatabaseConnectionInterface } from '@/Shared/Application/Database/DatabaseConnectionInterface'
import { DatabaseContextInterface } from '@/Shared/Application/Database/DatabaseContextInterface'
import { DatabaseInterface } from '@/Shared/Application/Database/DatabaseInterface'
import { Dispatcher } from '@/Shared/Application/Event/Dispatcher'
import { EventDispatcherInterface } from '@/Shared/Application/Event/EventDispatcherInterface'
import { FailedEventRepositoryInterface } from '@/Shared/Application/Event/FailedEventRepositoryInterface'
import { ListenerProvider } from '@/Shared/Application/Event/ListenerProvider'
import { ListenerProviderInterface } from '@/Shared/Application/Event/ListenerProviderInterface'
import { LoggerInterface } from '@/Shared/Application/LoggerInterface'
import { LoginService } from '@/Shared/Application/LoginService'
import { RouteConfig } from '@/Shared/Application/Router/RouteConfig'
import { ServiceProviderInterface } from '@/Shared/Application/ServiceProviderInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { TransactionalExecutorInterface } from '@/Shared/Application/TransactionalExecutorInterface'
import { UuidRepositoryInterface } from '@/Shared/Application/UuidRepositoryInterface'
import { WebSocketServerInterface } from '@/Shared/Application/WebSocketServerInterface'
import { ClockInterface } from '@/Shared/Domain/Clock/ClockInterface'
import { RefreshTokenRepositoryInterface } from '@/Shared/Domain/RefreshTokenRepositoryInterface'
import { ApplicationVersionRepository } from '@/Shared/Infrastructure/ApplicationVersionRepository'
import { AuthenticationMiddleware } from '@/Shared/Infrastructure/AuthenticationMiddleware'
import { Config } from '@/Shared/Infrastructure/Config'
import { CorsMiddleware } from '@/Shared/Infrastructure/CorsMiddleware'
import { Database } from '@/Shared/Infrastructure/Database'
import { DatabaseContext } from '@/Shared/Infrastructure/DatabaseContext'
import { ErrorHandlerMiddleware } from '@/Shared/Infrastructure/ErrorHandlerMiddleware'
import { ExpressApplicationFactory } from '@/Shared/Infrastructure/ExpressApplicationFactory'
import { Filesystem } from '@/Shared/Infrastructure/Filesystem/Filesystem'
import { FilesystemInterface } from '@/Shared/Infrastructure/Filesystem/FilesystemInterface'
import { HealthCheckController } from '@/Shared/Infrastructure/HealthCheckController'
import { InMemoryFailedEventRepository } from '@/Shared/Infrastructure/InMemoryFailedEventRepository'
import { Logger } from '@/Shared/Infrastructure/Logger'
import { LoginController } from '@/Shared/Infrastructure/LoginController'
import { LogoutController } from '@/Shared/Infrastructure/LogoutController'
import { NotFoundMiddleware } from '@/Shared/Infrastructure/NotFoundMiddleware'
import { PullDataController } from '@/Shared/Infrastructure/PullDataController'
import { RefreshTokenController } from '@/Shared/Infrastructure/RefreshTokenController'
import { RefreshTokenRepository } from '@/Shared/Infrastructure/RefreshTokenRepository'
import { RouteProvider } from '@/Shared/Infrastructure/Router/RouteProvider'
import { SystemClock } from '@/Shared/Infrastructure/SystemClock'
import { TimeoutMiddleware } from '@/Shared/Infrastructure/TimeoutMiddleware'
import { TransactionalExecutor } from '@/Shared/Infrastructure/TransactionalExecutor'
import { UuidRepository } from '@/Shared/Infrastructure/UuidRepository'
import { WebSocketServer } from '@/Shared/Infrastructure/WebSocketServer'

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
      .bind<ConfigInterface>(Symbols.ConfigInterface)
      .to(Config)
      .inSingletonScope()

    container
      .bind<LoggerInterface>(Symbols.LoggerInterface)
      .to(Logger)
      .inSingletonScope()

    container
      .bind<DatabaseConnectionInterface>(Symbols.DatabaseConnectionInterface)
      .to(Database)
      .inSingletonScope()

    container
      .bind<DatabaseInterface>(Symbols.DatabaseInterface)
      .to(Database)
      .inSingletonScope()

    container
      .bind<DatabaseContextInterface>(Symbols.DatabaseContextInterface)
      .to(DatabaseContext)
      .inSingletonScope()

    container
      .bind<TransactionalExecutorInterface>(
        Symbols.TransactionalExecutorInterface,
      )
      .to(TransactionalExecutor)
      .inSingletonScope()

    container
      .bind<FilesystemInterface>(Symbols.FilesystemInterface)
      .to(Filesystem)
      .inSingletonScope()

    container
      .bind<ClockInterface>(Symbols.ClockInterface)
      .to(SystemClock)
      .inSingletonScope()

    container
      .bind<ListenerProviderInterface>(Symbols.ListenerProviderInterface)
      .to(ListenerProvider)
      .inSingletonScope()

    container
      .bind<FailedEventRepositoryInterface>(
        Symbols.FailedEventRepositoryInterface,
      )
      .to(InMemoryFailedEventRepository)
      .inSingletonScope()

    container
      .bind<EventDispatcherInterface>(Symbols.EventDispatcherInterface)
      .to(Dispatcher)
      .inSingletonScope()

    container
      .bind<ApplicationVersionRepositoryInterface>(
        Symbols.ApplicationVersionRepositoryInterface,
      )
      .to(ApplicationVersionRepository)
      .inSingletonScope()

    container
      .bind<UuidRepositoryInterface>(Symbols.UuidRepositoryInterface)
      .to(UuidRepository)
      .inSingletonScope()

    container
      .bind<WebSocketServerInterface>(Symbols.WebSocketServerInterface)
      .to(WebSocketServer)
      .inSingletonScope()

    container
      .bind<RefreshTokenRepositoryInterface>(
        Symbols.RefreshTokenRepositoryInterface,
      )
      .to(RefreshTokenRepository)
      .inSingletonScope()

    container
      .bind<LoginService>(Symbols.LoginService)
      .to(LoginService)
      .inSingletonScope()

    container
      .bind<ControllerInterface>(Symbol.for(LoginController.name))
      .to(LoginController)

    container
      .bind<ControllerInterface>(Symbol.for(LogoutController.name))
      .to(LogoutController)

    container
      .bind<ControllerInterface>(Symbol.for(RefreshTokenController.name))
      .to(RefreshTokenController)

    container
      .bind<ControllerInterface>(Symbol.for(PullDataController.name))
      .to(PullDataController)

    container
      .bind<ControllerInterface>(Symbol.for(HealthCheckController.name))
      .to(HealthCheckController)

    container
      .bind<AuthenticationMiddleware>(AuthenticationMiddleware)
      .toSelf()
      .inSingletonScope()

    container
      .bind<ErrorHandlerMiddleware>(Symbols.ErrorHandlerMiddleware)
      .to(ErrorHandlerMiddleware)
      .inSingletonScope()

    container
      .bind<CorsMiddleware>(Symbols.CorsMiddleware)
      .to(CorsMiddleware)
      .inSingletonScope()

    container
      .bind<TimeoutMiddleware>(Symbols.TimeoutMiddleware)
      .to(TimeoutMiddleware)
      .inSingletonScope()

    container
      .bind<NotFoundMiddleware>(Symbols.NotFoundMiddleware)
      .to(NotFoundMiddleware)
      .inSingletonScope()

    container
      .bind<ApplicationFactoryInterface>(Symbols.ApplicationFactoryInterface)
      .to(ExpressApplicationFactory)
      .inSingletonScope()
  }
}
