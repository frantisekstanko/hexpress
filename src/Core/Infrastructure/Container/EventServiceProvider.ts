import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { Dispatcher } from '@/Core/Application/Event/Dispatcher'
import { ListenerProvider } from '@/Core/Application/Event/ListenerProvider'
import { Services } from '@/Core/Application/Services'
import { InMemoryFailedEventRepository } from '@/Core/Infrastructure/InMemoryFailedEventRepository'

export class EventServiceProvider {
  register(container: ContainerInterface): void {
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
  }
}
