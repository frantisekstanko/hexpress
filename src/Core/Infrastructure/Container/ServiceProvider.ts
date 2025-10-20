import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { Dispatcher } from '@/Core/Application/Event/Dispatcher'
import { ListenerProvider } from '@/Core/Application/Event/ListenerProvider'
import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'
import { Services } from '@/Core/Application/Services'
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
    container.registerSingleton(Services.ConfigInterface, Config)

    container.registerSingleton(Services.LoggerInterface, Logger)

    container.registerSingletonToSelf(Database)

    container.registerAlias(Services.DatabaseConnectionInterface, Database)

    container.registerAlias(Services.DatabaseInterface, Database)

    container.registerSingleton(
      Services.DatabaseContextInterface,
      DatabaseContext,
    )

    container.registerSingleton(
      Services.TransactionalExecutorInterface,
      TransactionalExecutor,
    )

    container.registerSingleton(
      Services.CommandHandlerRegistryInterface,
      CommandHandlerRegistry,
    )

    container.registerSingleton(Services.CommandBusInterface, CommandBus)

    container.registerSingleton(Services.FilesystemInterface, Filesystem)

    container.registerSingleton(Services.ClockInterface, SystemClock)

    container.registerSingleton(
      Services.ListenerProviderInterface,
      ListenerProvider,
    )

    container.registerSingleton(
      Services.FailedEventRepositoryInterface,
      InMemoryFailedEventRepository,
    )

    container.registerFactory(
      Services.EventDispatcherInterface,
      (container) =>
        new Dispatcher(
          container.get(Services.ListenerProviderInterface),
          container.get(Services.LoggerInterface),
          container.get(Services.FailedEventRepositoryInterface),
        ),
    )

    container.registerSingleton(
      Services.ApplicationVersionRepositoryInterface,
      ApplicationVersionRepository,
    )

    container.registerSingleton(
      Services.UuidRepositoryInterface,
      UuidRepository,
    )

    container.registerSingleton(
      Services.ConnectionValidatorInterface,
      ConnectionValidator,
    )

    container.registerSingleton(
      Services.AuthenticationHandlerInterface,
      AuthenticationHandler,
    )

    container.registerSingleton(
      Services.HeartbeatManagerInterface,
      HeartbeatManager,
    )

    container.registerSingleton(Services.BroadcasterInterface, Broadcaster)

    container.registerSingleton(
      Services.WebSocketServerInterface,
      WebSocketServer,
    )

    container.registerSingleton(
      Services.NotificationServiceInterface,
      WebSocketNotificationService,
    )

    container.registerSingleton(
      Services.WebSocketMessageParserInterface,
      WebSocketMessageParser,
    )

    container.registerTransient(
      Symbol.for(PullDataController.name),
      PullDataController,
    )

    container.registerTransient(
      Symbol.for(HealthCheckController.name),
      HealthCheckController,
    )

    container.registerSingleton(
      Services.ErrorHandlerMiddleware,
      ErrorHandlerMiddleware,
    )

    container.registerSingleton(Services.CorsMiddleware, CorsMiddleware)

    container.registerSingleton(Services.TimeoutMiddleware, TimeoutMiddleware)

    container.registerSingleton(Services.NotFoundMiddleware, NotFoundMiddleware)

    container.registerSingleton(
      Services.ApplicationFactoryInterface,
      ExpressApplicationFactory,
    )
  }
}
