import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { Services } from '@/Core/Application/Services'
import { CommandBus } from '@/Core/Infrastructure/CommandBus'
import { CommandHandlerRegistry } from '@/Core/Infrastructure/CommandHandlerRegistry'

export class CommandServiceProvider {
  register(container: ContainerInterface): void {
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
  }
}
