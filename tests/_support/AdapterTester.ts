import { TestDatabase } from '@Tests/_support/TestDatabase'
import { Assertion } from '@frantisekstanko/assertion'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { DatabaseConnectionInterface } from '@/Core/Application/Database/DatabaseConnectionInterface'
import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { DatabaseInterface } from '@/Core/Application/Database/DatabaseInterface'
import { Symbols } from '@/Core/Application/Symbols'
import { Container } from '@/Core/Infrastructure/Container'
import { ContainerFactory } from '@/Core/Infrastructure/ContainerFactory'

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
