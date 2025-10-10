import { AsyncLocalStorage } from 'node:async_hooks'
import { inject, injectable } from 'inversify'
import { DatabaseContextInterface } from '@/Shared/Application/Database/DatabaseContextInterface'
import { DatabaseInterface } from '@/Shared/Application/Database/DatabaseInterface'
import { Symbols } from '@/Shared/Application/Symbols'

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
    callback: () => Promise<Result>,
  ): Promise<Result> {
    return this.asyncLocalStorage.run(database, callback)
  }
}
