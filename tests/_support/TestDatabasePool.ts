import { DatabaseConnectionInterface } from '@/Shared/Application/Database/DatabaseConnectionInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { ContainerFactory } from '@/Shared/Infrastructure/ContainerFactory'

export class TestDatabasePool {
  private static connectionPool: DatabaseConnectionInterface | null = null

  public static getInstance(): DatabaseConnectionInterface {
    if (!TestDatabasePool.connectionPool) {
      const container = ContainerFactory.create()
      TestDatabasePool.connectionPool =
        container.get<DatabaseConnectionInterface>(
          Symbols.DatabaseConnectionInterface,
        )
    }

    return TestDatabasePool.connectionPool
  }

  public static async closeAll(): Promise<void> {
    if (TestDatabasePool.connectionPool) {
      await TestDatabasePool.connectionPool.close()
      TestDatabasePool.connectionPool = null
    }
  }
}
