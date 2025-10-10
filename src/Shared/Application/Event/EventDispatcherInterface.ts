import { EventInterface } from '@/Shared/Domain/Event/EventInterface'

export interface EventDispatcherInterface {
  dispatch(event: EventInterface): Promise<void>
}
