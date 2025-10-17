import { EventDispatcherInterface } from '@/Core/Application/Event/EventDispatcherInterface'

export class MockEventDispatcher implements EventDispatcherInterface {
  dispatch = jest.fn()
}
