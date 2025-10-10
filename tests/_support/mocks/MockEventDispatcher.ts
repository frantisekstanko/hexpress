import { EventDispatcherInterface } from '@/Shared/Application/Event/EventDispatcherInterface'

export class MockEventDispatcher implements EventDispatcherInterface {
  dispatch = jest.fn()
}
