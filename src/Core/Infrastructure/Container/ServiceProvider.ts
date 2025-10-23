import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'
import { Services } from '@/Core/Application/Services'
import { ApplicationVersionRepository } from '@/Core/Infrastructure/ApplicationVersionRepository'
import { Config } from '@/Core/Infrastructure/Config'
import { Filesystem } from '@/Core/Infrastructure/Filesystem/Filesystem'
import { LifecycleManager } from '@/Core/Infrastructure/LifecycleManager'
import { Logger } from '@/Core/Infrastructure/Logger'
import { SystemClock } from '@/Core/Infrastructure/SystemClock'
import { UuidRepository } from '@/Core/Infrastructure/UuidRepository'

export class ServiceProvider implements ServiceProviderInterface {
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

    container.register(
      Services.LifecycleManagerInterface,
      (container) =>
        new LifecycleManager(
          container.get(Services.LoggerInterface),
          container.get(Services.DatabaseConnectionInterface),
          container.get(Services.WebSocketServerInterface),
        ),
    )
  }
}
