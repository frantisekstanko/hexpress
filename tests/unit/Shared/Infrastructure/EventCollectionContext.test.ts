import { EventInterface } from '@/Core/Domain/Event/EventInterface'
import { EventCollectionContext } from '@/Core/Infrastructure/EventCollectionContext'

describe('EventCollectionContext', () => {
  let eventCollectionContext: EventCollectionContext
  let mockEvent1: EventInterface
  let mockEvent2: EventInterface

  beforeEach(() => {
    eventCollectionContext = new EventCollectionContext()
    mockEvent1 = { name: 'Event1' } as unknown as EventInterface
    mockEvent2 = { name: 'Event2' } as unknown as EventInterface
  })

  it('should not collect events when no context is set', () => {
    eventCollectionContext.collectEvent(mockEvent1)

    const events = eventCollectionContext.releaseEvents()
    expect(events).toEqual([])
  })

  it('should collect events when running in context', async () => {
    await eventCollectionContext.runInContext(async () => {
      await Promise.resolve()
      eventCollectionContext.collectEvent(mockEvent1)
      eventCollectionContext.collectEvent(mockEvent2)
      const events = eventCollectionContext.releaseEvents()
      expect(events).toEqual([mockEvent1, mockEvent2])
    })
  })

  it('should return empty array after context completes', async () => {
    await eventCollectionContext.runInContext(async () => {
      await Promise.resolve()
      eventCollectionContext.collectEvent(mockEvent1)
    })

    const events = eventCollectionContext.releaseEvents()
    expect(events).toEqual([])
  })

  it('should isolate context across concurrent executions', async () => {
    const event1 = { id: 'event1' } as unknown as EventInterface
    const event2 = { id: 'event2' } as unknown as EventInterface

    const promises = [
      eventCollectionContext.runInContext(async () => {
        eventCollectionContext.collectEvent(event1)
        await new Promise((resolve) => setTimeout(resolve, 10))
        return eventCollectionContext.releaseEvents()
      }),
      eventCollectionContext.runInContext(async () => {
        eventCollectionContext.collectEvent(event2)
        await new Promise((resolve) => setTimeout(resolve, 5))
        return eventCollectionContext.releaseEvents()
      }),
    ]

    const [result1, result2] = await Promise.all(promises)

    expect(result1).toEqual([event1])
    expect(result2).toEqual([event2])
  })

  it('should handle nested contexts correctly', async () => {
    const outerEvent = { id: 'outer' } as unknown as EventInterface
    const innerEvent = { id: 'inner' } as unknown as EventInterface

    await eventCollectionContext.runInContext(async () => {
      await Promise.resolve()
      eventCollectionContext.collectEvent(outerEvent)
      expect(eventCollectionContext.releaseEvents()).toEqual([outerEvent])

      await eventCollectionContext.runInContext(async () => {
        await Promise.resolve()
        eventCollectionContext.collectEvent(innerEvent)
        expect(eventCollectionContext.releaseEvents()).toEqual([innerEvent])
      })

      expect(eventCollectionContext.releaseEvents()).toEqual([outerEvent])
    })

    expect(eventCollectionContext.releaseEvents()).toEqual([])
  })

  it('should return copy of events array', async () => {
    await eventCollectionContext.runInContext(async () => {
      await Promise.resolve()
      eventCollectionContext.collectEvent(mockEvent1)
      const events1 = eventCollectionContext.releaseEvents()
      const events2 = eventCollectionContext.releaseEvents()

      expect(events1).toEqual([mockEvent1])
      expect(events2).toEqual([mockEvent1])
      expect(events1).not.toBe(events2)
    })
  })
})
