import { inject, injectable } from 'inversify'
import { AsynchronousOperationInterface } from '@/Core/Application/AsynchronousOperationInterface'
import { DatabaseConnectionInterface } from '@/Core/Application/Database/DatabaseConnectionInterface'
import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { Symbols } from '@/Core/Application/Symbols'
import { TransactionalExecutorInterface } from '@/Core/Application/TransactionalExecutorInterface'

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
