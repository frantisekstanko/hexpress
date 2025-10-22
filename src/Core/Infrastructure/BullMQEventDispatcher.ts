import { Worker } from 'bullmq'
import { EventDispatcherInterface } from '@/Core/Application/Event/EventDispatcherInterface'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { EventInterface } from '@/Core/Domain/Event/EventInterface'

export class BullMQEventDispatcher {
  private readonly worker: Worker

  constructor(
    redisHost: string,
    redisPort: number,
    private readonly eventDispatcher: EventDispatcherInterface,
    private readonly logger: LoggerInterface,
    concurrency = 5,
  ) {
    this.worker = new Worker(
      'domain-events',
      async (job) => {
        const event = job.data as EventInterface
        this.logger.info(`Dispatching event: ${job.name}`)
        await this.eventDispatcher.dispatch(event)
      },
      {
        connection: {
          host: redisHost,
          port: redisPort,
        },
        concurrency,
      },
    )

    this.worker.on('completed', (job) => {
      this.logger.info(`Event dispatched successfully: ${job.name}`)
    })

    this.worker.on('failed', (job, error) => {
      if (job) {
        this.logger.error(`Event dispatch failed: ${job.name}`, error)
      }
    })
  }

  async close(): Promise<void> {
    await this.worker.close()
  }
}
