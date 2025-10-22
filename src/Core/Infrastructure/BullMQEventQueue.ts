import { Queue } from 'bullmq'
import { EventQueueInterface } from '@/Core/Application/Event/EventQueueInterface'
import { EventInterface } from '@/Core/Domain/Event/EventInterface'

export class BullMQEventQueue implements EventQueueInterface {
  private readonly queue: Queue

  constructor(redisHost: string, redisPort: number) {
    this.queue = new Queue('domain-events', {
      connection: {
        host: redisHost,
        port: redisPort,
      },
    })
  }

  async enqueue(event: EventInterface): Promise<void> {
    await this.queue.add(event.constructor.name, event, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    })
  }

  async enqueueBatch(events: EventInterface[]): Promise<void> {
    const jobs = events.map((event) => ({
      name: event.constructor.name,
      data: event,
      opts: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }))

    await this.queue.addBulk(jobs)
  }

  async close(): Promise<void> {
    await this.queue.close()
  }
}
