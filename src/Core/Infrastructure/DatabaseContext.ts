import { AsyncLocalStorage } from 'node:async_hooks'
import { inject, injectable } from 'inversify'
import { AsynchronousOperationInterface } from '@/Core/Application/AsynchronousOperationInterface'
import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { DatabaseInterface } from '@/Core/Application/Database/DatabaseInterface'
import { Symbols } from '@/Core/Application/Symbols'

@injectable()
export class DatabaseContext implements DatabaseContextInterface {
  private asyncLocalStorage = new AsyncLocalStorage<DatabaseInterface>()

  constructor(
    @inject(Symbols.DatabaseInterface)
    private readonly databasePool: DatabaseInterface,
  ) {}

  public getCurrentDatabase(): DatabaseInterface {
    return this.asyncLocalStorage.getStore() ?? this.databasePool
  }

  public runInContext<Result>(
    database: DatabaseInterface,
    asynchronousOperation: AsynchronousOperationInterface<Result>,
  ): Promise<Result> {
    return this.asyncLocalStorage.run(database, asynchronousOperation)
  }
}
