import { FailedEvent } from '@/Shared/Application/Event/FailedEvent'

export interface FailedEventRepositoryInterface {
  save(failedEvent: FailedEvent): Promise<void>
  getAll(): Promise<FailedEvent[]>
}
