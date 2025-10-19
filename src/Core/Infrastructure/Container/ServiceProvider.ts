import { LoginService } from '@/Authentication/Application/LoginService'
import { Symbols as AuthSymbols } from '@/Authentication/Application/Symbols'
import { TokenGenerator } from '@/Authentication/Application/TokenGenerator'
import { TokenVerifier } from '@/Authentication/Application/TokenVerifier'
import { UserAuthenticator } from '@/Authentication/Application/UserAuthenticator'
import { AuthenticationMiddleware } from '@/Authentication/Infrastructure/AuthenticationMiddleware'
import { DurationParser } from '@/Authentication/Infrastructure/DurationParser'
import { JwtTokenCodec } from '@/Authentication/Infrastructure/JwtTokenCodec'
import { LoginController } from '@/Authentication/Infrastructure/LoginController'
import { LogoutController } from '@/Authentication/Infrastructure/LogoutController'
import { RefreshTokenController } from '@/Authentication/Infrastructure/RefreshTokenController'
import { RefreshTokenRepository } from '@/Authentication/Infrastructure/RefreshTokenRepository'
import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { Dispatcher } from '@/Core/Application/Event/Dispatcher'
import { ListenerProvider } from '@/Core/Application/Event/ListenerProvider'
import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'
import { Symbols } from '@/Core/Application/Symbols'
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
import { AuthenticationHandler } from '@/Core/Infrastructure/WebSocket/AuthenticationHandler'
import { Broadcaster } from '@/Core/Infrastructure/WebSocket/Broadcaster'
import { ConnectionValidator } from '@/Core/Infrastructure/WebSocket/ConnectionValidator'
import { HeartbeatManager } from '@/Core/Infrastructure/WebSocket/HeartbeatManager'
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

  register(container: ContainerInterface): void {
    container.registerSingleton(Symbols.ConfigInterface, Config)

    container.registerSingleton(Symbols.LoggerInterface, Logger)

    container.registerSingletonToSelf(Database)

    container.registerAlias(Symbols.DatabaseConnectionInterface, Database)

    container.registerAlias(Symbols.DatabaseInterface, Database)

    container.registerSingleton(
      Symbols.DatabaseContextInterface,
      DatabaseContext,
    )

    container.registerSingleton(
      Symbols.TransactionalExecutorInterface,
      TransactionalExecutor,
    )

    container.registerSingleton(
      Symbols.CommandHandlerRegistryInterface,
      CommandHandlerRegistry,
    )

    container.registerSingleton(Symbols.CommandBusInterface, CommandBus)

    container.registerSingleton(Symbols.FilesystemInterface, Filesystem)

    container.registerSingleton(Symbols.ClockInterface, SystemClock)

    container.registerSingleton(
      Symbols.ListenerProviderInterface,
      ListenerProvider,
    )

    container.registerSingleton(
      Symbols.FailedEventRepositoryInterface,
      InMemoryFailedEventRepository,
    )

    container.registerSingleton(Symbols.EventDispatcherInterface, Dispatcher)

    container.registerSingleton(
      Symbols.ApplicationVersionRepositoryInterface,
      ApplicationVersionRepository,
    )

    container.registerSingleton(Symbols.UuidRepositoryInterface, UuidRepository)

    container.registerSingleton(
      Symbols.ConnectionValidatorInterface,
      ConnectionValidator,
    )

    container.registerSingleton(
      Symbols.AuthenticationHandlerInterface,
      AuthenticationHandler,
    )

    container.registerSingleton(
      Symbols.HeartbeatManagerInterface,
      HeartbeatManager,
    )

    container.registerSingleton(Symbols.BroadcasterInterface, Broadcaster)

    container.registerSingleton(
      Symbols.WebSocketServerInterface,
      WebSocketServer,
    )

    container.registerSingleton(
      Symbols.NotificationServiceInterface,
      WebSocketNotificationService,
    )

    container.registerSingleton(
      Symbols.WebSocketMessageParserInterface,
      WebSocketMessageParser,
    )

    container.registerSingleton(AuthSymbols.TokenCodecInterface, JwtTokenCodec)

    container.registerSingleton(
      AuthSymbols.RefreshTokenRepositoryInterface,
      RefreshTokenRepository,
    )

    container.registerSingleton(
      AuthSymbols.DurationParserInterface,
      DurationParser,
    )

    container.registerSingleton(
      AuthSymbols.TokenGeneratorInterface,
      TokenGenerator,
    )

    container.registerSingleton(
      AuthSymbols.TokenVerifierInterface,
      TokenVerifier,
    )

    container.registerSingleton(
      AuthSymbols.UserAuthenticatorInterface,
      UserAuthenticator,
    )

    container.registerSingletonToSelf(LoginService)

    container.registerTransient(
      Symbol.for(LoginController.name),
      LoginController,
    )

    container.registerTransient(
      Symbol.for(LogoutController.name),
      LogoutController,
    )

    container.registerTransient(
      Symbol.for(RefreshTokenController.name),
      RefreshTokenController,
    )

    container.registerTransient(
      Symbol.for(PullDataController.name),
      PullDataController,
    )

    container.registerTransient(
      Symbol.for(HealthCheckController.name),
      HealthCheckController,
    )

    container.registerSingletonToSelf(AuthenticationMiddleware)

    container.registerSingleton(
      Symbols.ErrorHandlerMiddleware,
      ErrorHandlerMiddleware,
    )

    container.registerSingleton(Symbols.CorsMiddleware, CorsMiddleware)

    container.registerSingleton(Symbols.TimeoutMiddleware, TimeoutMiddleware)

    container.registerSingleton(Symbols.NotFoundMiddleware, NotFoundMiddleware)

    container.registerSingleton(
      Symbols.ApplicationFactoryInterface,
      ExpressApplicationFactory,
    )
  }
}
