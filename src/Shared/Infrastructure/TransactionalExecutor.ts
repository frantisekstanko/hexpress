import { inject, injectable } from 'inversify'
import { DatabaseConnectionInterface } from '@/Shared/Application/Database/DatabaseConnectionInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { TransactionalExecutorInterface } from '@/Shared/Application/TransactionalExecutorInterface'
import { DatabaseContext } from '@/Shared/Infrastructure/DatabaseContext'

@injectable()
export class TransactionalExecutor implements TransactionalExecutorInterface {
  constructor(
    @inject(Symbols.DatabaseConnectionInterface)
    private readonly database: DatabaseConnectionInterface,
    @inject(Symbols.DatabaseContextInterface)
    private readonly databaseContext: DatabaseContext,
  ) {}

  public async execute<Result>(
    callback: () => Promise<Result>,
  ): Promise<Result> {
    const transaction = await this.database.createTransaction()

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
