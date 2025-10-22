import { EventOutbox } from '@/Core/Application/Event/EventOutbox'
import { EventOutboxId } from '@/Core/Application/Event/EventOutboxId'
import { EventInterface } from '@/Core/Domain/Event/EventInterface'

export interface EventOutboxRepositoryInterface {
  saveMany(events: EventInterface[]): Promise<void>
  getUnprocessed(limit: number): Promise<EventOutbox[]>
  markAsProcessed(id: EventOutboxId): Promise<void>
}
