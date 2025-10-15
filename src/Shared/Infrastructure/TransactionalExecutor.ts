import { inject, injectable } from 'inversify'
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
    callback: () => Promise<Result>,
  ): Promise<Result> {
    const transaction = await this.databaseConnection.createTransaction()

    try {
      const result = await this.databaseContext.runInContext(
        transaction,
        callback,
      )
      await transaction.commit()
      return result
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}
