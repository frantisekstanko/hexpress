import { FailedEvent } from '@/Core/Application/Event/FailedEvent'
import { FailedEventRepositoryInterface } from '@/Core/Application/Event/FailedEventRepositoryInterface'

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
