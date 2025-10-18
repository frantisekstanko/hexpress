import { Container as InversifyContainer } from 'inversify'
import { LoginService } from '@/Authentication/Application/LoginService'
import { Symbols as AuthSymbols } from '@/Authentication/Application/Symbols'
import { TokenCodecInterface } from '@/Authentication/Application/TokenCodecInterface'
import { RefreshTokenRepositoryInterface } from '@/Authentication/Domain/RefreshTokenRepositoryInterface'
import { AuthenticationMiddleware } from '@/Authentication/Infrastructure/AuthenticationMiddleware'
import { JwtTokenCodec } from '@/Authentication/Infrastructure/JwtTokenCodec'
import { LoginController } from '@/Authentication/Infrastructure/LoginController'
import { LogoutController } from '@/Authentication/Infrastructure/LogoutController'
import { RefreshTokenController } from '@/Authentication/Infrastructure/RefreshTokenController'
import { RefreshTokenRepository } from '@/Authentication/Infrastructure/RefreshTokenRepository'
import { ApplicationFactoryInterface } from '@/Core/Application/ApplicationFactoryInterface'
import { ApplicationVersionRepositoryInterface } from '@/Core/Application/ApplicationVersionRepositoryInterface'
import { CommandBusInterface } from '@/Core/Application/Command/CommandBusInterface'
import { CommandHandlerRegistryInterface } from '@/Core/Application/Command/CommandHandlerRegistryInterface'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { DatabaseConnectionInterface } from '@/Core/Application/Database/DatabaseConnectionInterface'
import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { DatabaseInterface } from '@/Core/Application/Database/DatabaseInterface'
import { Dispatcher } from '@/Core/Application/Event/Dispatcher'
import { EventDispatcherInterface } from '@/Core/Application/Event/EventDispatcherInterface'
import { FailedEventRepositoryInterface } from '@/Core/Application/Event/FailedEventRepositoryInterface'
import { ListenerProvider } from '@/Core/Application/Event/ListenerProvider'
import { ListenerProviderInterface } from '@/Core/Application/Event/ListenerProviderInterface'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { NotificationServiceInterface } from '@/Core/Application/NotificationServiceInterface'
import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'
import { Symbols } from '@/Core/Application/Symbols'
import { TransactionalExecutorInterface } from '@/Core/Application/TransactionalExecutorInterface'
import { UuidRepositoryInterface } from '@/Core/Application/UuidRepositoryInterface'
import { WebSocketMessageParserInterface } from '@/Core/Application/WebSocket/WebSocketMessageParserInterface'
import { WebSocketServerInterface } from '@/Core/Application/WebSocketServerInterface'
import { ClockInterface } from '@/Core/Domain/Clock/ClockInterface'
import { ApplicationVersionRepository } from '@/Core/Infrastructure/ApplicationVersionRepository'
import { CommandBus } from '@/Core/Infrastructure/CommandBus'
import { CommandHandlerRegistry } from '@/Core/Infrastructure/CommandHandlerRegistry'
import { Config } from '@/Core/Infrastructure/Config'
import { CorsMiddleware } from '@/Core/Infrastructure/CorsMiddleware'
import { Database } from '@/Core/Infrastructure/Database'
import { DatabaseContext } from '@/Core/Infrastructure/DatabaseContext'
import { ErrorHandlerMiddleware } from '@/Core/Infrastructure/ErrorHandlerMiddleware'
import { ExpressApplicationFactory } from '@/Core/Infrastructure/ExpressApplicationFactory'
import { Filesystem } from '@/Core/Infrastructure/Filesystem/Filesystem'
import { FilesystemInterface } from '@/Core/Infrastructure/Filesystem/FilesystemInterface'
import { HealthCheckController } from '@/Core/Infrastructure/HealthCheckController'
import { InMemoryFailedEventRepository } from '@/Core/Infrastructure/InMemoryFailedEventRepository'
import { Logger } from '@/Core/Infrastructure/Logger'
import { NotFoundMiddleware } from '@/Core/Infrastructure/NotFoundMiddleware'
import { PullDataController } from '@/Core/Infrastructure/PullDataController'
import { RouteProvider } from '@/Core/Infrastructure/Router/RouteProvider'
import { SystemClock } from '@/Core/Infrastructure/SystemClock'
import { TimeoutMiddleware } from '@/Core/Infrastructure/TimeoutMiddleware'
import { TransactionalExecutor } from '@/Core/Infrastructure/TransactionalExecutor'
import { UuidRepository } from '@/Core/Infrastructure/UuidRepository'
import { WebSocketMessageParser } from '@/Core/Infrastructure/WebSocket/WebSocketMessageParser'
import { WebSocketNotificationService } from '@/Core/Infrastructure/WebSocketNotificationService'
import { WebSocketServer } from '@/Core/Infrastructure/WebSocketServer'

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

    container.bind<Database>(Database).toSelf().inSingletonScope()

    container
      .bind<DatabaseConnectionInterface>(Symbols.DatabaseConnectionInterface)
      .toService(Database)

    container
      .bind<DatabaseInterface>(Symbols.DatabaseInterface)
      .toService(Database)

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
      .bind<CommandHandlerRegistryInterface>(
        Symbols.CommandHandlerRegistryInterface,
      )
      .to(CommandHandlerRegistry)
      .inSingletonScope()

    container
      .bind<CommandBusInterface>(Symbols.CommandBusInterface)
      .to(CommandBus)
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
      .bind<NotificationServiceInterface>(Symbols.NotificationServiceInterface)
      .to(WebSocketNotificationService)
      .inSingletonScope()

    container
      .bind<WebSocketMessageParserInterface>(
        Symbols.WebSocketMessageParserInterface,
      )
      .to(WebSocketMessageParser)
      .inSingletonScope()

    container
      .bind<TokenCodecInterface>(AuthSymbols.TokenCodecInterface)
      .to(JwtTokenCodec)
      .inSingletonScope()

    container
      .bind<RefreshTokenRepositoryInterface>(
        AuthSymbols.RefreshTokenRepositoryInterface,
      )
      .to(RefreshTokenRepository)
      .inSingletonScope()

    container.bind<LoginService>(LoginService).toSelf().inSingletonScope()

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
