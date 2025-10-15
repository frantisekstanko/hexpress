import { TestDatabase } from '@Tests/_support/TestDatabase'
import { Assertion } from '@frantisekstanko/assertion'
import { ConfigInterface } from '@/Shared/Application/Config/ConfigInterface'
import { DatabaseConnectionInterface } from '@/Shared/Application/Database/DatabaseConnectionInterface'
import { DatabaseContextInterface } from '@/Shared/Application/Database/DatabaseContextInterface'
import { DatabaseInterface } from '@/Shared/Application/Database/DatabaseInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { Container } from '@/Shared/Infrastructure/Container'
import { ContainerFactory } from '@/Shared/Infrastructure/ContainerFactory'

export class AdapterTester {
  public database!: DatabaseConnectionInterface
  public container!: Container
  private testDatabase!: TestDatabase

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
    Assertion.string(process.env.DB_NAME)
    Assertion.string(process.env.JEST_WORKER_ID)

    process.env.DB_NAME = process.env.DB_NAME + process.env.JEST_WORKER_ID

    this.container = ContainerFactory.create()

    const config = this.container.get<ConfigInterface>(Symbols.ConfigInterface)

    this.testDatabase = new TestDatabase(config)
    await this.testDatabase.create()

    this.database = this.container.get<DatabaseConnectionInterface>(
      Symbols.DatabaseInterface,
    )
  }

  public async afterEach(): Promise<void> {
    await this.testDatabase.drop()
    await this.database.close()
  }

  public getDatabase(): DatabaseInterface {
    return this.database
  }

  public getDatabaseContext(): DatabaseContextInterface {
    return this.container.get<DatabaseContextInterface>(
      Symbols.DatabaseContextInterface,
    )
  }
}
