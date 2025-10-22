import { EventInterface } from '@/Core/Domain/Event/EventInterface'

export interface EventQueueInterface {
  enqueue(event: EventInterface): Promise<void>
  enqueueBatch(events: EventInterface[]): Promise<void>
}
