import { inject, injectable } from 'inversify'
import { AsynchronousOperationInterface } from '@/Shared/Application/AsynchronousOperationInterface'
import { DatabaseConnectionInterface } from '@/Shared/Application/Database/DatabaseConnectionInterface'
import { DatabaseContextInterface } from '@/Shared/Application/Database/DatabaseContextInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { TransactionalExecutorInterface } from '@/Shared/Application/TransactionalExecutorInterface'

@injectable()
export class TransactionalExecutor implements TransactionalExecutorInterface {
  constructor(
    @inject(Symbols.DatabaseConnectionInterface)
    private readonly databaseConnection: DatabaseConnectionInterface,
    @inject(Symbols.DatabaseContextInterface)
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
