import { inject, injectable } from 'inversify'
import { EventDispatcherInterface } from '@/Core/Application/Event/EventDispatcherInterface'
import { FailedEvent } from '@/Core/Application/Event/FailedEvent'
import { FailedEventRepositoryInterface } from '@/Core/Application/Event/FailedEventRepositoryInterface'
import { ListenerProviderInterface } from '@/Core/Application/Event/ListenerProviderInterface'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { Services } from '@/Core/Application/Services'
import { EventInterface } from '@/Core/Domain/Event/EventInterface'

@injectable()
export class Dispatcher implements EventDispatcherInterface {
  constructor(
    @inject(Services.ListenerProviderInterface)
    private readonly listenerProvider: ListenerProviderInterface,
    @inject(Services.LoggerInterface)
    private readonly logger: LoggerInterface,
    @inject(Services.FailedEventRepositoryInterface)
    private readonly failedEventRepository: FailedEventRepositoryInterface,
  ) {}

  public async dispatch(event: EventInterface): Promise<void> {
    const listeners = this.listenerProvider.getListenersForEvent(event)

    for (const listener of listeners) {
      try {
        await listener(event)
      } catch (error: unknown) {
        this.logger.error(`Error executing listener: ${listener.name}`, error)

        const failedEvent = new FailedEvent({
          event,
          listenerName: listener.name,
          error: error instanceof Error ? error : new Error(String(error)),
          failedAt: new Date(),
        })

        await this.failedEventRepository.save(failedEvent)
      }
    }
  }
}
