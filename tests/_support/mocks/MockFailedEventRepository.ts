import { FailedEvent } from '@/Shared/Application/Event/FailedEvent'
import { FailedEventRepositoryInterface } from '@/Shared/Application/Event/FailedEventRepositoryInterface'

export class MockFailedEventRepository
  implements FailedEventRepositoryInterface
{
  private savedFailedEvents: FailedEvent[] = []

  public async save(event: FailedEvent): Promise<void> {
    this.savedFailedEvents.push(event)
    return Promise.resolve()
  }

  public async getAll(): Promise<FailedEvent[]> {
    return Promise.resolve(this.savedFailedEvents)
  }
}
