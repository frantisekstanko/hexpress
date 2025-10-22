import { AdapterTester } from '@Tests/_support/AdapterTester'
import { TestClock } from '@Tests/_support/TestClock'
import { DateTime } from '@/Core/Domain/Clock/DateTime'
import { EventInterface } from '@/Core/Domain/Event/EventInterface'
import { UserId } from '@/Core/Domain/UserId'
import { Uuid } from '@/Core/Domain/Uuid'
import { DatabaseEventOutboxRepository } from '@/Core/Infrastructure/DatabaseEventOutboxRepository'
import { UuidRepository } from '@/Core/Infrastructure/UuidRepository'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentWasCreated } from '@/Document/Domain/DocumentWasCreated'

describe('DatabaseEventOutboxRepository', () => {
  const tester = AdapterTester.setup()
  let repository: DatabaseEventOutboxRepository
  let clock: TestClock
  let timeNow: DateTime
  let uuidRepository: UuidRepository
  let testEvent: DocumentWasCreated

  beforeEach(() => {
    timeNow = DateTime.parse('2025-10-05 14:30:33')
    clock = new TestClock(timeNow)
    uuidRepository = new UuidRepository()

    repository = new DatabaseEventOutboxRepository(
      tester.getDatabaseContext(),
      uuidRepository,
      clock,
    )

    testEvent = new DocumentWasCreated({
      documentId: new DocumentId(
        Uuid.fromString('e3a9f7b2-1c5d-4e8a-9f3b-2d1c5e8a9f3b'),
      ),
      documentName: 'test.md',
      ownerId: UserId.fromString('9f1ef472-1585-439c-8310-d740cf9a5333'),
    })
  })

  it('should save a single event to the outbox', async () => {
    await repository.saveMany([testEvent])

    const unprocessed = await repository.getUnprocessed(10)

    expect(unprocessed.length).toBe(1)
    expect(unprocessed[0].isProcessed()).toBe(false)
    expect(unprocessed[0].getCreatedAt()).toBeDefined()
  })

  it('should save multiple events to the outbox', async () => {
    const event2 = new DocumentWasCreated({
      documentId: new DocumentId(
        Uuid.fromString('169d0310-e002-4cda-a184-779acb6eff1a'),
      ),
      documentName: 'another.md',
      ownerId: UserId.fromString('9f1ef472-1585-439c-8310-d740cf9a5333'),
    })

    await repository.saveMany([testEvent, event2])

    const unprocessed = await repository.getUnprocessed(10)

    expect(unprocessed.length).toBe(2)
  })

  it('should return empty array when no unprocessed events', async () => {
    const unprocessed = await repository.getUnprocessed(10)

    expect(unprocessed.length).toBe(0)
  })

  it('should mark event as processed', async () => {
    await repository.saveMany([testEvent])

    const unprocessed = await repository.getUnprocessed(10)
    expect(unprocessed.length).toBe(1)

    const eventId = unprocessed[0].getId()
    await repository.markAsProcessed(eventId)

    const stillUnprocessed = await repository.getUnprocessed(10)
    expect(stillUnprocessed.length).toBe(0)
  })

  it('should respect limit when getting unprocessed events', async () => {
    const events: EventInterface[] = []
    for (let i = 0; i < 5; i++) {
      events.push(
        new DocumentWasCreated({
          documentId: new DocumentId(uuidRepository.getUuid()),
          documentName: `doc${i}.md`,
          ownerId: UserId.fromString('9f1ef472-1585-439c-8310-d740cf9a5333'),
        }),
      )
    }

    await repository.saveMany(events)

    const unprocessed = await repository.getUnprocessed(2)

    expect(unprocessed.length).toBe(2)
  })

  it('should not return processed events', async () => {
    await repository.saveMany([testEvent])

    const firstFetch = await repository.getUnprocessed(10)
    await repository.markAsProcessed(firstFetch[0].getId())

    const secondFetch = await repository.getUnprocessed(10)

    expect(secondFetch.length).toBe(0)
  })

  it('should handle empty saveMany', async () => {
    await repository.saveMany([])

    const unprocessed = await repository.getUnprocessed(10)

    expect(unprocessed.length).toBe(0)
  })

  it('should preserve event data through serialization', async () => {
    await repository.saveMany([testEvent])

    const unprocessed = await repository.getUnprocessed(10)
    const retrievedEvent = unprocessed[0].getEvent() as any

    expect(retrievedEvent.documentId.id.value).toBe(
      'e3a9f7b2-1c5d-4e8a-9f3b-2d1c5e8a9f3b',
    )
    expect(retrievedEvent.documentName).toBe('test.md')
    expect(retrievedEvent.ownerId.id.value).toBe(
      '9f1ef472-1585-439c-8310-d740cf9a5333',
    )
  })

  it('should set created_at timestamp correctly', async () => {
    await repository.saveMany([testEvent])

    const unprocessed = await repository.getUnprocessed(10)

    expect(unprocessed[0].getCreatedAt().toUnixtime()).toBe(
      timeNow.toUnixtime(),
    )
    expect(unprocessed[0].getProcessedAt()).toBeNull()
  })

  it('should set processed_at timestamp when marking as processed', async () => {
    await repository.saveMany([testEvent])

    const beforeProcess = await repository.getUnprocessed(10)
    const eventId = beforeProcess[0].getId()

    const oneHourLater = timeNow.advancedBy('1 hour')
    clock.setTime(oneHourLater)

    await repository.markAsProcessed(eventId)

    const result = await tester
      .getDatabase()
      .query('SELECT processed_at FROM event_outbox WHERE id = ?', [
        eventId.toString(),
      ])

    expect(result[0].processed_at).toBe(oneHourLater.toUnixtime())
  })
})
