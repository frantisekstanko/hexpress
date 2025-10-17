import { EventInterface } from '@/Core/Domain/Event/EventInterface'

export interface EventDispatcherInterface {
  dispatch(event: EventInterface): Promise<void>
}
