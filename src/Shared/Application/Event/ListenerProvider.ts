import { ListenerProviderInterface } from '@/Shared/Application/Event/ListenerProviderInterface'
import { EventInterface } from '@/Shared/Domain/Event/EventInterface'

type EventClass = abstract new (...args: never[]) => EventInterface

export class ListenerProvider implements ListenerProviderInterface {
  private readonly listeners = new Map<
    EventClass,
    ((event: EventInterface) => void | Promise<void>)[]
  >()

  private readonly listenersForAllEvents: ((
    event: EventInterface,
  ) => void | Promise<void>)[] = []

  public getListenersForEvent(
    event: EventInterface,
  ): ((event: EventInterface) => void | Promise<void>)[] {
    const eventClass = event.constructor as EventClass
    return [
      ...(this.listeners.get(eventClass) ?? []),
      ...this.listenersForAllEvents,
    ]
  }

  public addListener(
    eventClass: EventClass,
    listener: (event: EventInterface) => void | Promise<void>,
  ): void {
    if (!this.listeners.has(eventClass)) {
      this.listeners.set(eventClass, [])
    }
    const eventListeners = this.listeners.get(eventClass)
    if (eventListeners) {
      eventListeners.push(listener)
    }
  }

  public addGlobalListener(
    listener: (event: EventInterface) => void | Promise<void>,
  ): void {
    this.listenersForAllEvents.push(listener)
  }
}
