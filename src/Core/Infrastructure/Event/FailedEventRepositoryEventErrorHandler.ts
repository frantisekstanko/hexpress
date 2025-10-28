import { EventErrorHandlerInterface } from '@/Core/Application/Event/EventErrorHandlerInterface'
import { FailedEvent } from '@/Core/Application/Event/FailedEvent'
import { FailedEventRepositoryInterface } from '@/Core/Application/Event/FailedEventRepositoryInterface'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { EventInterface } from '@/Core/Domain/Event/EventInterface'

export class FailedEventRepositoryEventErrorHandler
  implements EventErrorHandlerInterface
{
  constructor(
    private readonly logger: LoggerInterface,
    private readonly failedEventRepository: FailedEventRepositoryInterface,
  ) {}

  public async handleError(
    error: Error,
    event: EventInterface,
    listenerName: string,
  ): Promise<void> {
    this.logger.error(`Error executing listener: ${listenerName}`, error)

    const failedEvent = new FailedEvent({
      event,
      listenerName,
      error,
      failedAt: new Date(),
    })

    await this.failedEventRepository.save(failedEvent)
  }
}
