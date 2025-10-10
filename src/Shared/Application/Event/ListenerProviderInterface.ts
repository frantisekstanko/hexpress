import { EventInterface } from '@/Shared/Domain/Event/EventInterface'

type EventClass = abstract new (...args: never[]) => EventInterface

export interface ListenerProviderInterface {
  getListenersForEvent(
    event: EventInterface,
  ): ((event: EventInterface) => void | Promise<void>)[]

  addListener(
    eventClass: EventClass,
    listener: (event: EventInterface) => void | Promise<void>,
  ): void

  addGlobalListener(
    listener: (event: EventInterface) => void | Promise<void>,
  ): void
}
