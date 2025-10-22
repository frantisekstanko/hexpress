import { EventDispatcherInterface } from '@/Core/Application/Event/EventDispatcherInterface'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { BullMQEventDispatcher } from '@/Core/Infrastructure/BullMQEventDispatcher'

describe('BullMQEventDispatcher', () => {
  let mockEventDispatcher: jest.Mocked<EventDispatcherInterface>
  let mockLogger: jest.Mocked<LoggerInterface>

  beforeEach(() => {
    mockEventDispatcher = {
      dispatch: jest.fn(),
    }

    mockLogger = {
      info: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      close: jest.fn(),
    }
  })

  it('should instantiate without errors', async () => {
    const dispatcher = new BullMQEventDispatcher(
      'localhost',
      6379,
      mockEventDispatcher,
      mockLogger,
      1,
    )

    expect(dispatcher).toBeDefined()

    await dispatcher.close()
  })

  it('should have close method', async () => {
    const dispatcher = new BullMQEventDispatcher(
      'localhost',
      6379,
      mockEventDispatcher,
      mockLogger,
      1,
    )

    expect(typeof dispatcher.close).toBe('function')

    await dispatcher.close()
  })
})
