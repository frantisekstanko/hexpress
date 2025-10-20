import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'
import { Services } from '@/Core/Application/Services'
import { ApplicationVersionRepository } from '@/Core/Infrastructure/ApplicationVersionRepository'
import { Config } from '@/Core/Infrastructure/Config'
import { CommandServiceProvider } from '@/Core/Infrastructure/Container/CommandServiceProvider'
import { DatabaseServiceProvider } from '@/Core/Infrastructure/Container/DatabaseServiceProvider'
import { EventServiceProvider } from '@/Core/Infrastructure/Container/EventServiceProvider'
import { HttpServiceProvider } from '@/Core/Infrastructure/Container/HttpServiceProvider'
import { WebSocketServiceProvider } from '@/Core/Infrastructure/Container/WebSocketServiceProvider'
import { Filesystem } from '@/Core/Infrastructure/Filesystem/Filesystem'
import { Logger } from '@/Core/Infrastructure/Logger'
import { RouteProvider } from '@/Core/Infrastructure/Router/RouteProvider'
import { SystemClock } from '@/Core/Infrastructure/SystemClock'
import { UuidRepository } from '@/Core/Infrastructure/UuidRepository'

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

    container.register(Services.FilesystemInterface, () => new Filesystem())

    container.register(Services.ClockInterface, () => new SystemClock())

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

    new DatabaseServiceProvider().register(container)
    new CommandServiceProvider().register(container)
    new EventServiceProvider().register(container)
    new WebSocketServiceProvider().register(container)
    new HttpServiceProvider().register(container)
  }
}
