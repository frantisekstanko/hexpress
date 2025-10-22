import { EventOutbox } from '@/Core/Application/Event/EventOutbox'
import { EventOutboxId } from '@/Core/Application/Event/EventOutboxId'
import { EventOutboxRepositoryInterface } from '@/Core/Application/Event/EventOutboxRepositoryInterface'
import { EventQueueInterface } from '@/Core/Application/Event/EventQueueInterface'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { DateTime } from '@/Core/Domain/Clock/DateTime'
import { UserId } from '@/Core/Domain/UserId'
import { Uuid } from '@/Core/Domain/Uuid'
import { OutboxRelayWorker } from '@/Core/Infrastructure/OutboxRelayWorker'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentWasCreated } from '@/Document/Domain/DocumentWasCreated'

describe('OutboxRelayWorker', () => {
  let worker: OutboxRelayWorker
  let mockOutboxRepository: jest.Mocked<EventOutboxRepositoryInterface>
  let mockEventQueue: jest.Mocked<EventQueueInterface>
  let mockLogger: jest.Mocked<LoggerInterface>

  beforeEach(() => {
    mockOutboxRepository = {
      getUnprocessed: jest.fn(),
      markAsProcessed: jest.fn(),
      saveMany: jest.fn(),
    }

    mockEventQueue = {
      enqueue: jest.fn(),
      enqueueBatch: jest.fn(),
    }

    mockLogger = {
      info: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      close: jest.fn(),
    }

    worker = new OutboxRelayWorker(
      mockOutboxRepository,
      mockEventQueue,
      mockLogger,
      100,
      5,
    )
  })

  afterEach(() => {
    worker.stop()
  })

  it('should start worker and log', () => {
    worker.start()

    expect(mockLogger.info).toHaveBeenCalledWith(
      'Starting OutboxRelayWorker (poll: 100ms, batch: 5)',
    )
  })

  it('should warn when starting already started worker', () => {
    worker.start()
    worker.start()

    expect(mockLogger.warning).toHaveBeenCalledWith(
      'OutboxRelayWorker already started',
    )
  })

  it('should stop worker and log', () => {
    worker.start()
    worker.stop()

    expect(mockLogger.info).toHaveBeenCalledWith('Stopping OutboxRelayWorker')
  })

  it('should warn when stopping non-running worker', () => {
    worker.stop()

    expect(mockLogger.warning).toHaveBeenCalledWith(
      'OutboxRelayWorker not running',
    )
  })

  it('should process outbox entries and enqueue events', async () => {
    const event = new DocumentWasCreated({
      documentId: new DocumentId(
        Uuid.fromString('e3a9f7b2-1c5d-4e8a-9f3b-2d1c5e8a9f3b'),
      ),
      documentName: 'test.md',
      ownerId: UserId.fromString('9f1ef472-1585-439c-8310-d740cf9a5333'),
    })

    const outboxEntry = new EventOutbox({
      id: EventOutboxId.fromString('169d0310-e002-4cda-a184-779acb6eff1a'),
      event,
      createdAt: DateTime.parse('2025-10-05 14:30:33'),
      processedAt: null,
    })

    mockOutboxRepository.getUnprocessed.mockResolvedValue([outboxEntry])
    mockEventQueue.enqueueBatch.mockResolvedValue()
    mockOutboxRepository.markAsProcessed.mockResolvedValue()

    worker.start()

    await new Promise((resolve) => setTimeout(resolve, 150))

    expect(mockOutboxRepository.getUnprocessed).toHaveBeenCalledWith(5)
    expect(mockEventQueue.enqueueBatch).toHaveBeenCalledWith([event])
    expect(mockOutboxRepository.markAsProcessed).toHaveBeenCalledWith(
      outboxEntry.getId(),
    )

    worker.stop()
  })

  it('should not process when no entries', async () => {
    mockOutboxRepository.getUnprocessed.mockResolvedValue([])

    worker.start()

    await new Promise((resolve) => setTimeout(resolve, 150))

    expect(mockOutboxRepository.getUnprocessed).toHaveBeenCalled()
    expect(mockEventQueue.enqueueBatch).not.toHaveBeenCalled()
    expect(mockOutboxRepository.markAsProcessed).not.toHaveBeenCalled()

    worker.stop()
  })

  it('should log error when processing fails', async () => {
    const error = new Error('Queue error')
    mockOutboxRepository.getUnprocessed.mockRejectedValue(error)

    worker.start()

    await new Promise((resolve) => setTimeout(resolve, 150))

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error processing outbox',
      error,
    )

    worker.stop()
  })

  it('should process multiple entries in batch', async () => {
    const entries = [
      new EventOutbox({
        id: EventOutboxId.fromString('e3a9f7b2-1c5d-4e8a-9f3b-2d1c5e8a9f3b'),
        event: new DocumentWasCreated({
          documentId: new DocumentId(
            Uuid.fromString('11111111-1111-1111-1111-111111111111'),
          ),
          documentName: 'test1.md',
          ownerId: UserId.fromString('9f1ef472-1585-439c-8310-d740cf9a5333'),
        }),
        createdAt: DateTime.parse('2025-10-05 14:30:33'),
        processedAt: null,
      }),
      new EventOutbox({
        id: EventOutboxId.fromString('169d0310-e002-4cda-a184-779acb6eff1a'),
        event: new DocumentWasCreated({
          documentId: new DocumentId(
            Uuid.fromString('22222222-2222-2222-2222-222222222222'),
          ),
          documentName: 'test2.md',
          ownerId: UserId.fromString('9f1ef472-1585-439c-8310-d740cf9a5333'),
        }),
        createdAt: DateTime.parse('2025-10-05 14:30:33'),
        processedAt: null,
      }),
    ]

    mockOutboxRepository.getUnprocessed.mockResolvedValue(entries)
    mockEventQueue.enqueueBatch.mockResolvedValue()
    mockOutboxRepository.markAsProcessed.mockResolvedValue()

    worker.start()

    await new Promise((resolve) => setTimeout(resolve, 150))

    expect(mockEventQueue.enqueueBatch).toHaveBeenCalledWith([
      entries[0].getEvent(),
      entries[1].getEvent(),
    ])
    expect(mockOutboxRepository.markAsProcessed).toHaveBeenCalledTimes(2)

    worker.stop()
  })
})
