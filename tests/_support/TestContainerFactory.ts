import { TestContainer } from '@Tests/_support/TestContainer'
import { TestDatabasePool } from '@Tests/_support/TestDatabasePool'
import { DatabaseConnectionInterface } from '@/Shared/Application/Database/DatabaseConnectionInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { ContainerFactory } from '@/Shared/Infrastructure/ContainerFactory'

export class TestContainerFactory {
  public static create(): TestContainer {
    const testDatabasePool = TestDatabasePool.getInstance()

    const container = ContainerFactory.create()

    const inversifyContainer = container.getInversifyContainer()

    void inversifyContainer.unbind(Symbols.DatabaseConnectionInterface)
    void inversifyContainer.unbind(Symbols.DatabaseInterface)

    inversifyContainer
      .bind<DatabaseConnectionInterface>(Symbols.DatabaseConnectionInterface)
      .toConstantValue(testDatabasePool)

    inversifyContainer
      .bind<DatabaseConnectionInterface>(Symbols.DatabaseInterface)
      .toConstantValue(testDatabasePool)

    return TestContainer.create(container)
  }
}
