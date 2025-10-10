import { EventLevel } from '@/Shared/Domain/Event/EventLevel'
import { EventType } from '@/Shared/Domain/Event/EventType'

export interface EventInterface {
  getEventName(): string
  getLevel(): EventLevel
  getLogMessage(): string
  getLogContext(): Record<string, string | number>
  getEventType(): EventType
}
