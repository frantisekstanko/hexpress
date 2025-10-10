import { DatabaseConnectionInterface } from '@/Shared/Application/Database/DatabaseConnectionInterface'
import { DatabaseTransactionInterface } from '@/Shared/Application/Database/DatabaseTransactionInterface'
import { DatabaseContext } from '@/Shared/Infrastructure/DatabaseContext'
import { TransactionalExecutor } from '@/Shared/Infrastructure/TransactionalExecutor'

describe('TransactionalExecutor', () => {
  let transactionalExecutor: TransactionalExecutor
  let mockDatabase: DatabaseConnectionInterface
  let mockTransaction: DatabaseTransactionInterface
  let mockDatabaseContext: DatabaseContext

  beforeEach(() => {
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    } as unknown as DatabaseTransactionInterface

    mockDatabase = {
      createTransaction: jest.fn().mockResolvedValue(mockTransaction),
    } as unknown as DatabaseConnectionInterface

    mockDatabaseContext = {
      runInContext: jest.fn().mockImplementation(async (db, callback) => {
        return (await callback()) as unknown
      }),
    } as unknown as DatabaseContext

    transactionalExecutor = new TransactionalExecutor(
      mockDatabase,
      mockDatabaseContext,
    )
  })

  it('should create transaction and run callback in context', async () => {
    const callback = jest.fn().mockResolvedValue('result')

    const result = await transactionalExecutor.execute(callback)

    expect(mockDatabase.createTransaction).toHaveBeenCalledTimes(1)
    expect(mockDatabaseContext.runInContext).toHaveBeenCalledWith(
      mockTransaction,
      callback,
    )
    expect(result).toBe('result')
  })

  it('should commit transaction on success', async () => {
    const callback = jest.fn().mockResolvedValue('success')

    await transactionalExecutor.execute(callback)

    expect(mockTransaction.commit).toHaveBeenCalledTimes(1)
    expect(mockTransaction.rollback).not.toHaveBeenCalled()
  })

  it('should rollback transaction on error', async () => {
    const error = new Error('Something went wrong')
    const callback = jest.fn().mockRejectedValue(error)

    await expect(transactionalExecutor.execute(callback)).rejects.toThrow(
      'Something went wrong',
    )

    expect(mockTransaction.rollback).toHaveBeenCalledTimes(1)
    expect(mockTransaction.commit).not.toHaveBeenCalled()
  })

  it('should propagate error after rollback', async () => {
    const error = new Error('Callback error')
    const callback = jest.fn().mockRejectedValue(error)

    await expect(transactionalExecutor.execute(callback)).rejects.toThrow(error)
  })

  it('should rollback even if commit fails', async () => {
    const commitError = new Error('Commit failed')
    mockTransaction.commit = jest.fn().mockRejectedValue(commitError)
    const callback = jest.fn().mockResolvedValue('result')

    await expect(transactionalExecutor.execute(callback)).rejects.toThrow(
      'Commit failed',
    )

    expect(mockTransaction.rollback).toHaveBeenCalledTimes(1)
  })
})
