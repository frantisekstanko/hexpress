import { EventDispatcherInterface } from '@/Core/Application/Event/EventDispatcherInterface'
import { EventErrorHandlerInterface } from '@/Core/Application/Event/EventErrorHandlerInterface'
import { ListenerProviderInterface } from '@/Core/Application/Event/ListenerProviderInterface'
import { EventInterface } from '@/Core/Domain/Event/EventInterface'

export class Dispatcher implements EventDispatcherInterface {
  constructor(
    private readonly listenerProvider: ListenerProviderInterface,
    private readonly eventErrorHandler: EventErrorHandlerInterface,
  ) {}

  public async dispatch(event: EventInterface): Promise<void> {
    const listeners = this.listenerProvider.getListenersForEvent(event)

    for (const listener of listeners) {
      try {
        await listener(event)
      } catch (error: unknown) {
        await this.eventErrorHandler.handleError(
          error instanceof Error ? error : new Error(String(error)),
          event,
          listener.name,
        )
      }
    }
  }
}
