import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { Services } from '@/Core/Application/Services'
import { Database } from '@/Core/Infrastructure/Database'
import { DatabaseContext } from '@/Core/Infrastructure/DatabaseContext'
import { EventCollectionContext } from '@/Core/Infrastructure/EventCollectionContext'
import { TransactionalExecutor } from '@/Core/Infrastructure/TransactionalExecutor'

export class DatabaseServiceProvider {
  register(container: ContainerInterface): void {
    container.register(
      Database,
      (container) => new Database(container.get(Services.ConfigInterface)),
    )

    container.register(Services.DatabaseConnectionInterface, (container) =>
      container.get(Database),
    )

    container.register(Services.DatabaseInterface, (container) =>
      container.get(Database),
    )

    container.register(
      Services.DatabaseContextInterface,
      (container) =>
        new DatabaseContext(container.get(Services.DatabaseInterface)),
    )

    container.register(
      Services.EventCollectionContextInterface,
      () => new EventCollectionContext(),
    )

    container.register(
      Services.TransactionalExecutorInterface,
      (container) =>
        new TransactionalExecutor(
          container.get(Services.DatabaseConnectionInterface),
          container.get(Services.DatabaseContextInterface),
          container.get(Services.EventCollectionContextInterface),
          container.get(Services.EventDispatcherInterface),
          container.get(Services.FailedEventRepositoryInterface),
          container.get(Services.LoggerInterface),
        ),
    )
  }
}
