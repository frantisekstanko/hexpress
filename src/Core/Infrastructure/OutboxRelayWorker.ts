import { EventOutboxRepositoryInterface } from '@/Core/Application/Event/EventOutboxRepositoryInterface'
import { EventQueueInterface } from '@/Core/Application/Event/EventQueueInterface'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'

export class OutboxRelayWorker {
  private intervalId: NodeJS.Timeout | null = null
  private isProcessing = false

  constructor(
    private readonly outboxRepository: EventOutboxRepositoryInterface,
    private readonly eventQueue: EventQueueInterface,
    private readonly logger: LoggerInterface,
    private readonly pollIntervalMs = 500,
    private readonly batchSize = 10,
  ) {}

  public start(): void {
    if (this.intervalId !== null) {
      this.logger.warning('OutboxRelayWorker already started')
      return
    }

    this.logger.info(
      `Starting OutboxRelayWorker (poll: ${String(this.pollIntervalMs)}ms, batch: ${String(this.batchSize)})`,
    )

    this.intervalId = setInterval(() => {
      void this.processOutbox()
    }, this.pollIntervalMs)
  }

  public stop(): void {
    if (this.intervalId === null) {
      this.logger.warning('OutboxRelayWorker not running')
      return
    }

    this.logger.info('Stopping OutboxRelayWorker')
    clearInterval(this.intervalId)
    this.intervalId = null
  }

  private async processOutbox(): Promise<void> {
    if (this.isProcessing) {
      return
    }

    this.isProcessing = true

    try {
      const outboxEntries = await this.outboxRepository.getUnprocessed(
        this.batchSize,
      )

      if (outboxEntries.length === 0) {
        this.isProcessing = false
        return
      }

      this.logger.info(
        `Processing ${String(outboxEntries.length)} outbox entries`,
      )

      const events = outboxEntries.map((entry) => entry.getEvent())
      await this.eventQueue.enqueueBatch(events)

      for (const entry of outboxEntries) {
        await this.outboxRepository.markAsProcessed(entry.getId())
      }

      this.logger.info(
        `Successfully processed ${String(outboxEntries.length)} outbox entries`,
      )
    } catch (error: unknown) {
      this.logger.error('Error processing outbox', error)
    } finally {
      this.isProcessing = false
    }
  }
}
