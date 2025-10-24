import { DatabaseConnectionInterface } from '@/Core/Application/Database/DatabaseConnectionInterface'
import { DatabaseTransactionInterface } from '@/Core/Application/Database/DatabaseTransactionInterface'
import { EventCollectionContextInterface } from '@/Core/Application/Event/EventCollectionContextInterface'
import { EventDispatcherInterface } from '@/Core/Application/Event/EventDispatcherInterface'
import { FailedEventRepositoryInterface } from '@/Core/Application/Event/FailedEventRepositoryInterface'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { EventInterface } from '@/Core/Domain/Event/EventInterface'
import { DatabaseContext } from '@/Core/Infrastructure/DatabaseContext'
import { TransactionalExecutor } from '@/Core/Infrastructure/TransactionalExecutor'

describe('TransactionalExecutor', () => {
  let transactionalExecutor: TransactionalExecutor
  let mockDatabase: DatabaseConnectionInterface
  let mockTransaction: DatabaseTransactionInterface
  let mockDatabaseContext: DatabaseContext
  let mockEventCollectionContext: EventCollectionContextInterface
  let mockEventDispatcher: EventDispatcherInterface
  let mockFailedEventRepository: FailedEventRepositoryInterface
  let mockLogger: LoggerInterface

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

    mockEventCollectionContext = {
      runInContext: jest.fn().mockImplementation(async (callback) => {
        return (await callback()) as unknown
      }),
      releaseEvents: jest.fn().mockReturnValue([]),
      collectEvent: jest.fn(),
    } as unknown as EventCollectionContextInterface

    mockEventDispatcher = {
      dispatch: jest.fn().mockResolvedValue(undefined),
    } as unknown as EventDispatcherInterface

    mockFailedEventRepository = {
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as FailedEventRepositoryInterface

    mockLogger = {
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as LoggerInterface

    transactionalExecutor = new TransactionalExecutor(
      mockDatabase,
      mockDatabaseContext,
      mockEventCollectionContext,
      mockEventDispatcher,
      mockFailedEventRepository,
      mockLogger,
    )
  })

  it('should create transaction and run callback in contexts', async () => {
    const callback = jest.fn().mockResolvedValue('result')

    const result = await transactionalExecutor.execute(callback)

    expect(mockDatabase.createTransaction).toHaveBeenCalledTimes(1)
    expect(mockEventCollectionContext.runInContext).toHaveBeenCalledTimes(1)
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

  it('should dispatch events after commit', async () => {
    const mockEvent1 = {
      getEventName: () => 'Event1',
    } as unknown as EventInterface
    const mockEvent2 = {
      getEventName: () => 'Event2',
    } as unknown as EventInterface

    mockEventCollectionContext.releaseEvents = jest
      .fn()
      .mockReturnValue([mockEvent1, mockEvent2])

    const callback = jest.fn().mockResolvedValue('result')

    await transactionalExecutor.execute(callback)

    expect(mockTransaction.commit).toHaveBeenCalledTimes(1)
    expect(mockEventCollectionContext.releaseEvents).toHaveBeenCalledTimes(1)
    expect(mockEventDispatcher.dispatch).toHaveBeenCalledTimes(2)
    expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith(mockEvent1)
    expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith(mockEvent2)
  })

  it('should not dispatch events if rollback occurs', async () => {
    const mockEvent = {
      getEventName: () => 'Event1',
    } as unknown as EventInterface

    mockEventCollectionContext.releaseEvents = jest
      .fn()
      .mockReturnValue([mockEvent])

    const callback = jest.fn().mockRejectedValue(new Error('Callback error'))

    await expect(transactionalExecutor.execute(callback)).rejects.toThrow(
      'Callback error',
    )

    expect(mockTransaction.rollback).toHaveBeenCalledTimes(1)
    expect(mockEventDispatcher.dispatch).not.toHaveBeenCalled()
  })

  it('should save failed events when event dispatch fails after commit', async () => {
    const mockEvent = {
      getEventName: () => 'FailingEvent',
    } as unknown as EventInterface

    mockEventCollectionContext.releaseEvents = jest
      .fn()
      .mockReturnValue([mockEvent])

    const dispatchError = new Error('Dispatch failed')
    mockEventDispatcher.dispatch = jest.fn().mockRejectedValue(dispatchError)

    const callback = jest.fn().mockResolvedValue('result')

    const result = await transactionalExecutor.execute(callback)

    expect(result).toBe('result')
    expect(mockTransaction.commit).toHaveBeenCalledTimes(1)
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error dispatching event after commit: FailingEvent',
      dispatchError,
    )
    expect(mockFailedEventRepository.save).toHaveBeenCalledTimes(1)
    expect(mockFailedEventRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        event: mockEvent,
        listenerName: 'unknown',
        error: dispatchError,
      }),
    )
  })

  it('should continue dispatching remaining events when one fails', async () => {
    const mockEvent1 = {
      getEventName: () => 'Event1',
    } as unknown as EventInterface
    const mockEvent2 = {
      getEventName: () => 'Event2',
    } as unknown as EventInterface
    const mockEvent3 = {
      getEventName: () => 'Event3',
    } as unknown as EventInterface

    mockEventCollectionContext.releaseEvents = jest
      .fn()
      .mockReturnValue([mockEvent1, mockEvent2, mockEvent3])

    mockEventDispatcher.dispatch = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Event2 failed'))
      .mockResolvedValueOnce(undefined)

    const callback = jest.fn().mockResolvedValue('result')

    await transactionalExecutor.execute(callback)

    expect(mockEventDispatcher.dispatch).toHaveBeenCalledTimes(3)
    expect(mockFailedEventRepository.save).toHaveBeenCalledTimes(1)
    expect(mockLogger.error).toHaveBeenCalledTimes(1)
  })
})
