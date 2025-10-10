import { TestDatabasePool } from '@Tests/_support/TestDatabasePool'

afterAll(async () => {
  await TestDatabasePool.closeAll()
})
