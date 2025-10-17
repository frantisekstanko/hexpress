import { FailedEvent } from '@/Core/Application/Event/FailedEvent'

export interface FailedEventRepositoryInterface {
  save(failedEvent: FailedEvent): Promise<void>
  getAll(): Promise<FailedEvent[]>
}
