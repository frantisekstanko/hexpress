import { injectable } from 'inversify'
import { FailedEvent } from '@/Shared/Application/Event/FailedEvent'
import { FailedEventRepositoryInterface } from '@/Shared/Application/Event/FailedEventRepositoryInterface'

@injectable()
export class InMemoryFailedEventRepository
  implements FailedEventRepositoryInterface
{
  private readonly failedEvents: FailedEvent[] = []

  public save(failedEvent: FailedEvent): Promise<void> {
    this.failedEvents.push(failedEvent)
    return Promise.resolve()
  }

  public getAll(): Promise<FailedEvent[]> {
    return Promise.resolve([...this.failedEvents])
  }
}
