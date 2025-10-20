import { AsynchronousOperationInterface } from '@/Core/Application/AsynchronousOperationInterface'
import { DatabaseConnectionInterface } from '@/Core/Application/Database/DatabaseConnectionInterface'
import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { TransactionalExecutorInterface } from '@/Core/Application/TransactionalExecutorInterface'

export class TransactionalExecutor implements TransactionalExecutorInterface {
  constructor(
    private readonly databaseConnection: DatabaseConnectionInterface,
    private readonly databaseContext: DatabaseContextInterface,
  ) {}

  public async execute<Result>(
    asynchronousOperation: AsynchronousOperationInterface<Result>,
  ): Promise<Result> {
    const databaseTransaction =
      await this.databaseConnection.createTransaction()

    try {
      const result = await this.databaseContext.runInContext(
        databaseTransaction,
        asynchronousOperation,
      )
      await databaseTransaction.commit()
      return result
    } catch (error) {
      await databaseTransaction.rollback()
      throw error
    }
  }
}
