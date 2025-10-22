import { Queue } from 'bullmq'
import { UserId } from '@/Core/Domain/UserId'
import { Uuid } from '@/Core/Domain/Uuid'
import { BullMQEventQueue } from '@/Core/Infrastructure/BullMQEventQueue'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentWasCreated } from '@/Document/Domain/DocumentWasCreated'

describe('BullMQEventQueue', () => {
  const redisPort = Number(process.env.REDIS_PORT)
  let queue: BullMQEventQueue
  let inspectorQueue: Queue

  beforeEach(() => {
    queue = new BullMQEventQueue('localhost', redisPort)
    inspectorQueue = new Queue('domain-events', {
      connection: { host: 'localhost', port: redisPort },
    })
  })

  afterEach(async () => {
    await inspectorQueue.obliterate({ force: true })
    await queue.close()
    await inspectorQueue.close()
  })

  it('should enqueue a single event', async () => {
    const event = new DocumentWasCreated({
      documentId: new DocumentId(
        Uuid.fromString('e3a9f7b2-1c5d-4e8a-9f3b-2d1c5e8a9f3b'),
      ),
      documentName: 'test.md',
      ownerId: UserId.fromString('9f1ef472-1585-439c-8310-d740cf9a5333'),
    })

    await queue.enqueue(event)

    const jobCounts = await inspectorQueue.getJobCounts()
    expect(jobCounts.waiting).toBe(1)
  })

  it('should enqueue batch of events', async () => {
    const events = [
      new DocumentWasCreated({
        documentId: new DocumentId(
          Uuid.fromString('e3a9f7b2-1c5d-4e8a-9f3b-2d1c5e8a9f3b'),
        ),
        documentName: 'test1.md',
        ownerId: UserId.fromString('9f1ef472-1585-439c-8310-d740cf9a5333'),
      }),
      new DocumentWasCreated({
        documentId: new DocumentId(
          Uuid.fromString('169d0310-e002-4cda-a184-779acb6eff1a'),
        ),
        documentName: 'test2.md',
        ownerId: UserId.fromString('9f1ef472-1585-439c-8310-d740cf9a5333'),
      }),
    ]

    await queue.enqueueBatch(events)

    const jobCounts = await inspectorQueue.getJobCounts()
    expect(jobCounts.waiting).toBe(2)
  })

  it('should configure retry attempts', async () => {
    const event = new DocumentWasCreated({
      documentId: new DocumentId(
        Uuid.fromString('e3a9f7b2-1c5d-4e8a-9f3b-2d1c5e8a9f3b'),
      ),
      documentName: 'test.md',
      ownerId: UserId.fromString('9f1ef472-1585-439c-8310-d740cf9a5333'),
    })

    await queue.enqueue(event)

    const jobs = await inspectorQueue.getJobs(['waiting'])
    expect(jobs[0].opts.attempts).toBe(3)
  })

  it('should configure exponential backoff', async () => {
    const event = new DocumentWasCreated({
      documentId: new DocumentId(
        Uuid.fromString('e3a9f7b2-1c5d-4e8a-9f3b-2d1c5e8a9f3b'),
      ),
      documentName: 'test.md',
      ownerId: UserId.fromString('9f1ef472-1585-439c-8310-d740cf9a5333'),
    })

    await queue.enqueue(event)

    const jobs = await inspectorQueue.getJobs(['waiting'])
    expect(jobs[0].opts.backoff).toEqual({
      type: 'exponential',
      delay: 2000,
    })
  })
})
