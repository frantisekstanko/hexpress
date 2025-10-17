import { EventLevel } from '@/Core/Domain/Event/EventLevel'
import { EventType } from '@/Core/Domain/Event/EventType'

export interface EventInterface {
  getEventName(): string
  getLevel(): EventLevel
  getLogMessage(): string
  getLogContext(): Record<string, string | number>
  getEventType(): EventType
}
