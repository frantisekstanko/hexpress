import { TestContainer } from '@Tests/_support/TestContainer'
import { TestContainerFactory } from '@Tests/_support/TestContainerFactory'
import { TestDatabasePool } from '@Tests/_support/TestDatabasePool'
import { DatabaseConnectionInterface } from '@/Shared/Application/Database/DatabaseConnectionInterface'
import { DatabaseInterface } from '@/Shared/Application/Database/DatabaseInterface'
import { DatabaseTransactionInterface } from '@/Shared/Application/Database/DatabaseTransactionInterface'
import { Symbols } from '@/Shared/Application/Symbols'

export class AdapterTester {
  public transaction!: DatabaseTransactionInterface
  public container!: TestContainer
  private database!: DatabaseConnectionInterface

  public static setup(): AdapterTester {
    const tester = new AdapterTester()

    beforeEach(async () => {
      await tester.beforeEach()
    })

    afterEach(async () => {
      await tester.afterEach()
    })

    return tester
  }

  public async beforeEach(): Promise<void> {
    this.container = TestContainerFactory.create()
    this.database = TestDatabasePool.getInstance()

    this.transaction = await this.database.createTransaction()

    this.container.replace(
      Symbols.DatabaseConnectionInterface,
      this.transaction,
    )
    this.container.replace(Symbols.DatabaseInterface, this.transaction)
  }

  public async afterEach(): Promise<void> {
    await this.transaction.rollback()
    this.container.replace(Symbols.DatabaseConnectionInterface, this.database)
    this.container.replace(Symbols.DatabaseInterface, this.database)
  }

  public getDatabase(): DatabaseInterface {
    return this.transaction
  }
}
