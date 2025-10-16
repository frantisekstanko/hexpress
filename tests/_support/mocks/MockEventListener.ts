import { EventInterface } from '@/Core/Domain/Event/EventInterface'

export class MockEventListener<T extends EventInterface> {
  private events: T[] = []
  public readonly listener = jest.fn((event: EventInterface) => {
    this.events.push(event as T)
  })

  public getLastEvent(): T | undefined {
    return this.events[this.events.length - 1]
  }

  public getAllEvents(): T[] {
    return [...this.events]
  }

  public getEventCount(): number {
    return this.events.length
  }

  public clear(): void {
    this.events = []
    this.listener.mockClear()
  }
}
