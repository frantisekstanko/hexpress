import { AsynchronousOperationInterface } from '@/Core/Application/AsynchronousOperationInterface'
import { EventInterface } from '@/Core/Domain/Event/EventInterface'

export interface EventCollectionContextInterface {
  collectEvent(event: EventInterface): void
  releaseEvents(): EventInterface[]
  runInContext<Result>(
    asynchronousOperation: AsynchronousOperationInterface<Result>,
  ): Promise<Result>
}
