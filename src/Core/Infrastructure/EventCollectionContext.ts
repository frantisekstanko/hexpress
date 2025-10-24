import { AsyncLocalStorage } from 'node:async_hooks'
import { AsynchronousOperationInterface } from '@/Core/Application/AsynchronousOperationInterface'
import { EventCollectionContextInterface } from '@/Core/Application/Event/EventCollectionContextInterface'
import { EventInterface } from '@/Core/Domain/Event/EventInterface'

export class EventCollectionContext implements EventCollectionContextInterface {
  private asyncLocalStorage = new AsyncLocalStorage<EventInterface[]>()

  public collectEvent(event: EventInterface): void {
    const events = this.asyncLocalStorage.getStore()
    if (events) {
      events.push(event)
    }
  }

  public releaseEvents(): EventInterface[] {
    const events = this.asyncLocalStorage.getStore() ?? []
    return [...events]
  }

  public runInContext<Result>(
    asynchronousOperation: AsynchronousOperationInterface<Result>,
  ): Promise<Result> {
    return this.asyncLocalStorage.run([], asynchronousOperation)
  }
}
