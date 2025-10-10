import { EventInterface } from '@/Shared/Domain/Event/EventInterface'

export abstract class EventRecording {
  private events: EventInterface[] = []

  protected recordEvent(event: EventInterface): void {
    this.events.push(event)
  }

  public releaseEvents(): EventInterface[] {
    const events = [...this.events]
    this.events = []
    return events
  }
}
