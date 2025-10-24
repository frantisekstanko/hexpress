import { AsyncLocalStorage } from 'node:async_hooks'
import { AsynchronousOperationInterface } from '@/Core/Application/AsynchronousOperationInterface'
import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { DatabaseInterface } from '@/Core/Application/Database/DatabaseInterface'

export class DatabaseContext implements DatabaseContextInterface {
  private asyncLocalStorage = new AsyncLocalStorage<DatabaseInterface>()

  constructor(private readonly databasePool: DatabaseInterface) {}

  public getDatabase(): DatabaseInterface {
    return this.asyncLocalStorage.getStore() ?? this.databasePool
  }

  public runInContext<Result>(
    database: DatabaseInterface,
    asynchronousOperation: AsynchronousOperationInterface<Result>,
  ): Promise<Result> {
    return this.asyncLocalStorage.run(database, asynchronousOperation)
  }
}
