import { AdapterTester } from '@Tests/_support/AdapterTester'
import { Express } from 'express'
import supertest from 'supertest'
import { ApplicationFactoryInterface } from '@/Core/Application/ApplicationFactoryInterface'
import { Services } from '@/Core/Application/Services'

export class FlowTester extends AdapterTester {
  private readonly USERS_TABLE = 'users'

  public request!: ReturnType<typeof supertest>
  private application!: Express

  public static setup(): FlowTester {
    const tester = new FlowTester()

    beforeEach(async () => {
      await tester.beforeEach()
    })

    afterEach(async () => {
      await tester.afterEach()
    })

    return tester
  }

  public async beforeEach(): Promise<void> {
    await super.beforeEach()

    const applicationFactory = this.container.get<ApplicationFactoryInterface>(
      Services.ApplicationFactoryInterface,
    )

    this.application = applicationFactory.create() as Express
    this.request = supertest(this.application)
  }

  public async createUser(
    userId: string,
    username: string,
    password: string,
  ): Promise<void> {
    await this.database.query(
      `INSERT INTO ${this.USERS_TABLE} (
        userId,
        username,
        password
      ) VALUES (?, ?, ?)`,
      [userId, username, password],
    )
  }

  public async createDocument({
    documentName,
    accessToken,
  }: {
    documentName: string
    userId: string
    accessToken: string
  }): Promise<void> {
    await this.request
      .post('/api/v1/document')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ documentName })
  }
}
