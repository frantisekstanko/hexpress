import { AdapterTester } from '@Tests/_support/AdapterTester'
import { Dispatcher } from '@/Shared/Application/Event/Dispatcher'
import { FailedEventRepositoryInterface } from '@/Shared/Application/Event/FailedEventRepositoryInterface'
import { ListenerProvider } from '@/Shared/Application/Event/ListenerProvider'
import { Symbols } from '@/Shared/Application/Symbols'
import { EventInterface } from '@/Shared/Domain/Event/EventInterface'
import { EventLevel } from '@/Shared/Domain/Event/EventLevel'
import { EventType } from '@/Shared/Domain/Event/EventType'

class TestEventOne implements EventInterface {
  public getEventName(): string {
    return 'TestEventOne'
  }

  public getLevel(): EventLevel {
    return EventLevel.INFO
  }

  public getLogMessage(): string {
    return 'Test event one'
  }

  public getLogContext(): Record<string, string | number> {
    return {}
  }

  public getEventType(): EventType {
    return EventType.MANUAL
  }
}

class TestEventTwo implements EventInterface {
  public getEventName(): string {
    return 'TestEventTwo'
  }

  public getLevel(): EventLevel {
    return EventLevel.INFO
  }

  public getLogMessage(): string {
    return 'Test event two'
  }

  public getLogContext(): Record<string, string | number> {
    return {}
  }

  public getEventType(): EventType {
    return EventType.MANUAL
  }
}

describe('Event Listener Chain Integration', () => {
  const tester = AdapterTester.setup()
  let dispatcher: Dispatcher
  let listenerProvider: ListenerProvider
  let failedEventRepository: FailedEventRepositoryInterface

  beforeEach(() => {
    dispatcher = tester.container.get<Dispatcher>(
      Symbols.EventDispatcherInterface,
    )
    listenerProvider = tester.container.get<ListenerProvider>(
      Symbols.ListenerProviderInterface,
    )
    failedEventRepository =
      tester.container.get<FailedEventRepositoryInterface>(
        Symbols.FailedEventRepositoryInterface,
      )
  })

  describe('multiple listeners for single event', () => {
    it('should execute all registered listeners in order', async () => {
      const executionOrder: string[] = []
      const event = new TestEventOne()

      const listenerOne = jest.fn(() => {
        executionOrder.push('listener-one')
      })
      const listenerTwo = jest.fn(() => {
        executionOrder.push('listener-two')
      })
      const listenerThree = jest.fn(() => {
        executionOrder.push('listener-three')
      })

      listenerProvider.addListener(TestEventOne, listenerOne)
      listenerProvider.addListener(TestEventOne, listenerTwo)
      listenerProvider.addListener(TestEventOne, listenerThree)

      await dispatcher.dispatch(event)

      expect(listenerOne).toHaveBeenCalledWith(event)
      expect(listenerTwo).toHaveBeenCalledWith(event)
      expect(listenerThree).toHaveBeenCalledWith(event)
      expect(executionOrder).toEqual([
        'listener-one',
        'listener-two',
        'listener-three',
      ])

      const failedEvents = await failedEventRepository.getAll()
      expect(failedEvents).toHaveLength(0)
    })
  })

  describe('global listeners with specific listeners', () => {
    it('should execute specific listeners first then global listeners', async () => {
      const executionOrder: string[] = []
      const event = new TestEventOne()

      const specificListener = jest.fn(() => {
        executionOrder.push('specific')
      })
      const globalListener = jest.fn(() => {
        executionOrder.push('global')
      })

      listenerProvider.addListener(TestEventOne, specificListener)
      listenerProvider.addGlobalListener(globalListener)

      await dispatcher.dispatch(event)

      expect(specificListener).toHaveBeenCalledWith(event)
      expect(globalListener).toHaveBeenCalledWith(event)
      expect(executionOrder).toEqual(['specific', 'global'])
    })

    it('should execute global listeners for all event types', async () => {
      const globalListener = jest.fn()
      listenerProvider.addGlobalListener(globalListener)

      const eventOne = new TestEventOne()
      const eventTwo = new TestEventTwo()

      await dispatcher.dispatch(eventOne)
      await dispatcher.dispatch(eventTwo)

      expect(globalListener).toHaveBeenCalledTimes(2)
      expect(globalListener).toHaveBeenCalledWith(eventOne)
      expect(globalListener).toHaveBeenCalledWith(eventTwo)
    })
  })

  describe('failed listener not breaking chain', () => {
    it('should continue executing remaining listeners when one fails', async () => {
      const executionOrder: string[] = []
      const event = new TestEventOne()
      const error = new Error('Listener failed')

      const listenerOne = jest.fn(() => {
        executionOrder.push('listener-one')
      })
      const failingListener = jest.fn(() => {
        executionOrder.push('failing-listener')
        throw error
      })
      Object.defineProperty(failingListener, 'name', {
        value: 'failingListener',
      })

      const listenerThree = jest.fn(() => {
        executionOrder.push('listener-three')
      })

      listenerProvider.addListener(TestEventOne, listenerOne)
      listenerProvider.addListener(TestEventOne, failingListener)
      listenerProvider.addListener(TestEventOne, listenerThree)

      await dispatcher.dispatch(event)

      expect(listenerOne).toHaveBeenCalledWith(event)
      expect(failingListener).toHaveBeenCalledWith(event)
      expect(listenerThree).toHaveBeenCalledWith(event)
      expect(executionOrder).toEqual([
        'listener-one',
        'failing-listener',
        'listener-three',
      ])

      const failedEvents = await failedEventRepository.getAll()
      expect(failedEvents).toHaveLength(1)
      expect(failedEvents[0].getEvent()).toBe(event)
      expect(failedEvents[0].getListenerName()).toBe('failingListener')
      expect(failedEvents[0].getError()).toBe(error)
    })

    it('should record multiple failed listeners independently', async () => {
      const event = new TestEventOne()
      const errorOne = new Error('First failure')
      const errorTwo = new Error('Second failure')

      const failingListenerOne = jest.fn(() => {
        throw errorOne
      })
      Object.defineProperty(failingListenerOne, 'name', {
        value: 'failingListenerOne',
      })

      const successListener = jest.fn()

      const failingListenerTwo = jest.fn(() => {
        throw errorTwo
      })
      Object.defineProperty(failingListenerTwo, 'name', {
        value: 'failingListenerTwo',
      })

      listenerProvider.addListener(TestEventOne, failingListenerOne)
      listenerProvider.addListener(TestEventOne, successListener)
      listenerProvider.addListener(TestEventOne, failingListenerTwo)

      await dispatcher.dispatch(event)

      expect(successListener).toHaveBeenCalled()

      const failedEvents = await failedEventRepository.getAll()
      expect(failedEvents).toHaveLength(2)
      expect(failedEvents[0].getListenerName()).toBe('failingListenerOne')
      expect(failedEvents[0].getError()).toBe(errorOne)
      expect(failedEvents[1].getListenerName()).toBe('failingListenerTwo')
      expect(failedEvents[1].getError()).toBe(errorTwo)
    })
  })

  describe('listener execution order preservation', () => {
    it('should preserve registration order across multiple events', async () => {
      const executionLog: { event: string; listener: string }[] = []

      const listenerA = jest.fn((event: EventInterface) => {
        executionLog.push({ event: event.getEventName(), listener: 'A' })
      })
      const listenerB = jest.fn((event: EventInterface) => {
        executionLog.push({ event: event.getEventName(), listener: 'B' })
      })
      const listenerC = jest.fn((event: EventInterface) => {
        executionLog.push({ event: event.getEventName(), listener: 'C' })
      })

      listenerProvider.addListener(TestEventOne, listenerA)
      listenerProvider.addListener(TestEventOne, listenerB)
      listenerProvider.addListener(TestEventOne, listenerC)

      const eventOne = new TestEventOne()
      const eventTwo = new TestEventOne()

      await dispatcher.dispatch(eventOne)
      await dispatcher.dispatch(eventTwo)

      expect(executionLog).toEqual([
        { event: 'TestEventOne', listener: 'A' },
        { event: 'TestEventOne', listener: 'B' },
        { event: 'TestEventOne', listener: 'C' },
        { event: 'TestEventOne', listener: 'A' },
        { event: 'TestEventOne', listener: 'B' },
        { event: 'TestEventOne', listener: 'C' },
      ])
    })
  })

  describe('different listeners for different events', () => {
    it('should only execute listeners registered for specific event type', async () => {
      const eventOneListener = jest.fn()
      const eventTwoListener = jest.fn()

      listenerProvider.addListener(TestEventOne, eventOneListener)
      listenerProvider.addListener(TestEventTwo, eventTwoListener)

      const eventOne = new TestEventOne()
      const eventTwo = new TestEventTwo()

      await dispatcher.dispatch(eventOne)

      expect(eventOneListener).toHaveBeenCalledWith(eventOne)
      expect(eventTwoListener).not.toHaveBeenCalled()

      await dispatcher.dispatch(eventTwo)

      expect(eventTwoListener).toHaveBeenCalledWith(eventTwo)
      expect(eventOneListener).toHaveBeenCalledTimes(1)
    })
  })

  describe('async listener execution', () => {
    it('should wait for async listeners to complete before continuing', async () => {
      const executionOrder: string[] = []
      const event = new TestEventOne()

      const asyncListenerOne = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        executionOrder.push('async-one')
      })

      const asyncListenerTwo = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 25))
        executionOrder.push('async-two')
      })

      listenerProvider.addListener(TestEventOne, asyncListenerOne)
      listenerProvider.addListener(TestEventOne, asyncListenerTwo)

      await dispatcher.dispatch(event)

      expect(executionOrder).toEqual(['async-one', 'async-two'])
    })
  })
})
