import { EventInterface } from '@/Core/Domain/Event/EventInterface'

export interface EventErrorHandlerInterface {
  handleError(
    error: Error,
    event: EventInterface,
    listenerName: string,
  ): Promise<void>
}
