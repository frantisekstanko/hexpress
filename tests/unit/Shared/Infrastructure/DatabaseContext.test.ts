import { DatabaseInterface } from '@/Core/Application/Database/DatabaseInterface'
import { DatabaseContext } from '@/Core/Infrastructure/DatabaseContext'

describe('DatabaseContext', () => {
  let databaseContext: DatabaseContext
  let mockPoolDatabase: DatabaseInterface
  let mockTransactionDatabase: DatabaseInterface

  beforeEach(() => {
    mockPoolDatabase = {} as DatabaseInterface
    mockTransactionDatabase = {} as DatabaseInterface
    databaseContext = new DatabaseContext(mockPoolDatabase)
  })

  it('should return pool database when no context is set', () => {
    const currentDatabase = databaseContext.getCurrentDatabase()

    expect(currentDatabase).toBe(mockPoolDatabase)
  })

  it('should return transaction database when running in context', async () => {
    await databaseContext.runInContext(mockTransactionDatabase, async () => {
      await Promise.resolve()
      const currentDatabase = databaseContext.getCurrentDatabase()
      expect(currentDatabase).toBe(mockTransactionDatabase)
    })
  })

  it('should return pool database after context completes', async () => {
    await databaseContext.runInContext(mockTransactionDatabase, async () => {
      await Promise.resolve()
      expect(databaseContext.getCurrentDatabase()).toBe(mockTransactionDatabase)
    })

    const currentDatabase = databaseContext.getCurrentDatabase()
    expect(currentDatabase).toBe(mockPoolDatabase)
  })

  it('should isolate context across concurrent executions', async () => {
    const mockTransaction1 = { id: 'tx1' } as unknown as DatabaseInterface
    const mockTransaction2 = { id: 'tx2' } as unknown as DatabaseInterface

    const promises = [
      databaseContext.runInContext(mockTransaction1, async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return databaseContext.getCurrentDatabase()
      }),
      databaseContext.runInContext(mockTransaction2, async () => {
        await new Promise((resolve) => setTimeout(resolve, 5))
        return databaseContext.getCurrentDatabase()
      }),
    ]

    const [result1, result2] = await Promise.all(promises)

    expect(result1).toBe(mockTransaction1)
    expect(result2).toBe(mockTransaction2)
  })

  it('should handle nested contexts correctly', async () => {
    const mockTransaction1 = { id: 'tx1' } as unknown as DatabaseInterface
    const mockTransaction2 = { id: 'tx2' } as unknown as DatabaseInterface

    await databaseContext.runInContext(mockTransaction1, async () => {
      expect(databaseContext.getCurrentDatabase()).toBe(mockTransaction1)

      await databaseContext.runInContext(mockTransaction2, async () => {
        await Promise.resolve()
        expect(databaseContext.getCurrentDatabase()).toBe(mockTransaction2)
      })

      expect(databaseContext.getCurrentDatabase()).toBe(mockTransaction1)
    })

    expect(databaseContext.getCurrentDatabase()).toBe(mockPoolDatabase)
  })
})
