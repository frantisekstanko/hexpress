import { MockFailedEventRepository } from '@Tests/_support/mocks/MockFailedEventRepository'
import { Dispatcher } from '@/Core/Application/Event/Dispatcher'
import { ListenerProviderInterface } from '@/Core/Application/Event/ListenerProviderInterface'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { EventInterface } from '@/Core/Domain/Event/EventInterface'
import { EventLevel } from '@/Core/Domain/Event/EventLevel'
import { EventType } from '@/Core/Domain/Event/EventType'

class TestEvent implements EventInterface {
  public getEventName(): string {
    return 'TestEvent'
  }

  public getLevel(): EventLevel {
    return EventLevel.INFO
  }

  public getLogMessage(): string {
    return 'Test event'
  }

  public getLogContext(): Record<string, string | number> {
    return {}
  }

  public getEventType(): EventType {
    return EventType.MANUAL
  }
}

describe('Dispatcher', () => {
  let dispatcher: Dispatcher
  let listenerProvider: jest.Mocked<ListenerProviderInterface>
  let logger: jest.Mocked<LoggerInterface>
  let failedEventRepository: MockFailedEventRepository

  beforeEach(() => {
    listenerProvider = {
      getListenersForEvent: jest.fn(),
      addListener: jest.fn(),
      addGlobalListener: jest.fn(),
    } as jest.Mocked<ListenerProviderInterface>

    logger = {
      info: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      close: jest.fn(),
    } as jest.Mocked<LoggerInterface>

    failedEventRepository = new MockFailedEventRepository()

    dispatcher = new Dispatcher(listenerProvider, logger, failedEventRepository)
  })

  describe('dispatch', () => {
    it('should execute all listeners for an event', async () => {
      const event = new TestEvent()
      const listener1 = jest.fn()
      const listener2 = jest.fn()

      listenerProvider.getListenersForEvent.mockReturnValue([
        listener1,
        listener2,
      ])

      await dispatcher.dispatch(event)

      expect(listener1).toHaveBeenCalledWith(event)
      expect(listener2).toHaveBeenCalledWith(event)
      const failedEvents = await failedEventRepository.getAll()
      expect(failedEvents).toHaveLength(0)
    })

    it('should store failed event in dead letter queue when listener throws error', async () => {
      const event = new TestEvent()
      const error = new Error('Listener failed')
      const failingListener = jest.fn().mockRejectedValue(error)
      Object.defineProperty(failingListener, 'name', {
        value: 'failingListener',
      })

      listenerProvider.getListenersForEvent.mockReturnValue([failingListener])

      await dispatcher.dispatch(event)

      expect(logger.error).toHaveBeenCalledWith(
        'Error executing listener: failingListener',
        error,
      )

      const failedEvents = await failedEventRepository.getAll()
      expect(failedEvents).toHaveLength(1)
      expect(failedEvents[0].getEvent()).toBe(event)
      expect(failedEvents[0].getListenerName()).toBe('failingListener')
      expect(failedEvents[0].getError()).toBe(error)
      expect(failedEvents[0].getFailedAt()).toBeInstanceOf(Date)
    })

    it('should continue executing remaining listeners after one fails', async () => {
      const event = new TestEvent()
      const listener1 = jest.fn()
      const failingListener = jest.fn().mockRejectedValue(new Error('Failed'))
      Object.defineProperty(failingListener, 'name', {
        value: 'failingListener',
      })
      const listener3 = jest.fn()

      listenerProvider.getListenersForEvent.mockReturnValue([
        listener1,
        failingListener,
        listener3,
      ])

      await dispatcher.dispatch(event)

      expect(listener1).toHaveBeenCalledWith(event)
      expect(failingListener).toHaveBeenCalledWith(event)
      expect(listener3).toHaveBeenCalledWith(event)
      const failedEvents = await failedEventRepository.getAll()
      expect(failedEvents).toHaveLength(1)
    })

    it('should handle non-Error exceptions', async () => {
      const event = new TestEvent()
      const failingListener = jest.fn().mockRejectedValue('string error')
      Object.defineProperty(failingListener, 'name', {
        value: 'failingListener',
      })

      listenerProvider.getListenersForEvent.mockReturnValue([failingListener])

      await dispatcher.dispatch(event)

      const failedEvents = await failedEventRepository.getAll()
      expect(failedEvents).toHaveLength(1)
      expect(failedEvents[0].getError()).toBeInstanceOf(Error)
      expect(failedEvents[0].getError().message).toBe('string error')
    })
  })
})
