import { LoginService } from '@/Authentication/Application/LoginService'
import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { Dispatcher } from '@/Core/Application/Event/Dispatcher'
import { ListenerProvider } from '@/Core/Application/Event/ListenerProvider'
import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'
import { Services } from '@/Core/Application/Services'
import { BroadcasterInterface } from '@/Core/Application/WebSocket/BroadcasterInterface'
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
    container.register(Services.ConfigInterface, () => new Config())

    container.register(
      Services.LoggerInterface,
      (container) => new Logger(container.get(Services.ConfigInterface)),
    )

    container.register(
      Database,
      (container) => new Database(container.get(Services.ConfigInterface)),
    )

    container.registerAlias(Services.DatabaseConnectionInterface, Database)

    container.registerAlias(Services.DatabaseInterface, Database)

    container.register(
      Services.DatabaseContextInterface,
      (container) =>
        new DatabaseContext(container.get(Services.DatabaseInterface)),
    )

    container.register(
      Services.TransactionalExecutorInterface,
      (container) =>
        new TransactionalExecutor(
          container.get(Services.DatabaseConnectionInterface),
          container.get(Services.DatabaseContextInterface),
        ),
    )

    container.register(
      Services.CommandHandlerRegistryInterface,
      () => new CommandHandlerRegistry(),
    )

    container.register(
      Services.CommandBusInterface,
      (container) =>
        new CommandBus(
          container.get(Services.CommandHandlerRegistryInterface),
          container.get(Services.TransactionalExecutorInterface),
        ),
    )

    container.register(Services.FilesystemInterface, () => new Filesystem())

    container.register(Services.ClockInterface, () => new SystemClock())

    container.register(
      Services.ListenerProviderInterface,
      () => new ListenerProvider(),
    )

    container.register(
      Services.FailedEventRepositoryInterface,
      () => new InMemoryFailedEventRepository(),
    )

    container.register(
      Services.EventDispatcherInterface,
      (container) =>
        new Dispatcher(
          container.get(Services.ListenerProviderInterface),
          container.get(Services.LoggerInterface),
          container.get(Services.FailedEventRepositoryInterface),
        ),
    )

    container.register(
      Services.ApplicationVersionRepositoryInterface,
      (container) =>
        new ApplicationVersionRepository(
          container.get(Services.FilesystemInterface),
        ),
    )

    container.register(
      Services.UuidRepositoryInterface,
      () => new UuidRepository(),
    )

    container.register(
      Services.ConnectionValidatorInterface,
      (container) =>
        new ConnectionValidator(
          container.get(Services.LoggerInterface),
          container.get(Services.ConfigInterface),
        ),
    )

    container.register(
      Services.AuthenticationHandlerInterface,
      (container) => new AuthenticationHandler(container.get(LoginService)),
    )

    container.register(
      Services.HeartbeatManagerInterface,
      (container) =>
        new HeartbeatManager(container.get(Services.ConfigInterface)),
    )

    container.register(Services.BroadcasterInterface, () => new Broadcaster())

    container.register(
      Services.WebSocketServerInterface,
      (container) =>
        new WebSocketServer(
          container.get(Services.LoggerInterface),
          container.get(Services.ConfigInterface),
          container.get(Services.WebSocketMessageParserInterface),
          container.get(Services.ConnectionValidatorInterface),
          container.get(Services.AuthenticationHandlerInterface),
          container.get(Services.HeartbeatManagerInterface),
          container.get(Services.BroadcasterInterface) as BroadcasterInterface &
            Broadcaster,
        ),
    )

    container.register(
      Services.NotificationServiceInterface,
      (container) =>
        new WebSocketNotificationService(
          container.get(Services.WebSocketServerInterface),
        ),
    )

    container.register(
      Services.WebSocketMessageParserInterface,
      () => new WebSocketMessageParser(),
    )

    container.register(
      Symbol.for(PullDataController.name),
      (container) =>
        new PullDataController(
          container.get(Services.ApplicationVersionRepositoryInterface),
        ),
    )

    container.register(
      Symbol.for(HealthCheckController.name),
      (container) =>
        new HealthCheckController(
          container.get(Services.DatabaseContextInterface),
          container.get(Services.ConfigInterface),
        ),
    )

    container.register(
      Services.ErrorHandlerMiddleware,
      (container) =>
        new ErrorHandlerMiddleware(container.get(Services.LoggerInterface)),
    )

    container.register(
      Services.CorsMiddleware,
      (container) =>
        new CorsMiddleware(container.get(Services.ConfigInterface)),
    )

    container.register(
      Services.TimeoutMiddleware,
      (container) =>
        new TimeoutMiddleware(container.get(Services.ConfigInterface)),
    )

    container.register(
      Services.NotFoundMiddleware,
      (container) =>
        new NotFoundMiddleware(container.get(Services.LoggerInterface)),
    )

    container.register(
      Services.ApplicationFactoryInterface,
      (container) =>
        new ExpressApplicationFactory(
          container.get(Services.CorsMiddleware),
          container.get(Services.TimeoutMiddleware),
          container.get(Services.RouterInterface),
          container.get(Services.NotFoundMiddleware),
          container.get(Services.ErrorHandlerMiddleware),
        ),
    )
  }
}
