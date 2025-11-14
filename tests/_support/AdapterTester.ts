import { TestDatabase } from '@Tests/_support/TestDatabase'
import { ContainerFactory } from '@/ContainerFactory'
import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { DatabaseConnectionInterface } from '@/Core/Application/Database/DatabaseConnectionInterface'
import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { DatabaseInterface } from '@/Core/Application/Database/DatabaseInterface'
import { Services } from '@/Core/Application/Services'
import { Assertion } from '@/Core/Domain/Assert/Assertion'

export class AdapterTester {
  public database!: DatabaseConnectionInterface
  public container!: ContainerInterface
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

    const config = this.container.get(Services.ConfigInterface)

    this.testDatabase = new TestDatabase(config)
    await this.testDatabase.create()

    this.database = this.container.get(Services.DatabaseConnectionInterface)
  }

  public async afterEach(): Promise<void> {
    await this.testDatabase.drop()
    await this.database.close()
  }

  public getDatabase(): DatabaseInterface {
    return this.database
  }

  public getDatabaseContext(): DatabaseContextInterface {
    return this.container.get(Services.DatabaseContextInterface)
  }
}
