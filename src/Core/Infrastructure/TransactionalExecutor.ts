import { AsynchronousOperationInterface } from '@/Core/Application/AsynchronousOperationInterface'
import { DatabaseConnectionInterface } from '@/Core/Application/Database/DatabaseConnectionInterface'
import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { EventCollectionContextInterface } from '@/Core/Application/Event/EventCollectionContextInterface'
import { EventDispatcherInterface } from '@/Core/Application/Event/EventDispatcherInterface'
import { TransactionalExecutorInterface } from '@/Core/Application/TransactionalExecutorInterface'

export class TransactionalExecutor implements TransactionalExecutorInterface {
  constructor(
    private readonly databaseConnection: DatabaseConnectionInterface,
    private readonly databaseContext: DatabaseContextInterface,
    private readonly eventCollectionContext: EventCollectionContextInterface,
    private readonly eventDispatcher: EventDispatcherInterface,
  ) {}

  public async execute<Result>(
    asynchronousOperation: AsynchronousOperationInterface<Result>,
  ): Promise<Result> {
    const databaseTransaction =
      await this.databaseConnection.createTransaction()

    try {
      const { result, events } = await this.eventCollectionContext.runInContext(
        async () => {
          const result = await this.databaseContext.runInContext(
            databaseTransaction,
            asynchronousOperation,
          )
          const events = this.eventCollectionContext.releaseEvents()
          return { result, events }
        },
      )

      await databaseTransaction.commit()

      for (const event of events) {
        await this.eventDispatcher.dispatch(event)
      }

      return result
    } catch (error) {
      await databaseTransaction.rollback()
      throw error
    }
  }
}
