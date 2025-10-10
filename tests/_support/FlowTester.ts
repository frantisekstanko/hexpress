import { AdapterTester } from '@Tests/_support/AdapterTester'
import supertest from 'supertest'
import { ApplicationFactoryInterface } from '@/Shared/Application/ApplicationFactoryInterface'
import { ApplicationInterface } from '@/Shared/Application/ApplicationInterface'
import { Symbols } from '@/Shared/Application/Symbols'

export class FlowTester extends AdapterTester {
  private readonly USERS_TABLE = 'users'

  public request!: ReturnType<typeof supertest>
  private application!: ApplicationInterface

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
      Symbols.ApplicationFactoryInterface,
    )

    this.application = applicationFactory.create()
    this.request = supertest(this.application)
  }

  public async createUser(
    userId: string,
    username: string,
    password: string,
  ): Promise<void> {
    await this.transaction.query(
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
