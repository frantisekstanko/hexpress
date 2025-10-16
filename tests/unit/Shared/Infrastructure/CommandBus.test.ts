import { CommandBusInterface } from '@/Shared/Application/Command/CommandBusInterface'
import { CommandHandlerInterface } from '@/Shared/Application/Command/CommandHandlerInterface'
import { CommandHandlerRegistryInterface } from '@/Shared/Application/Command/CommandHandlerRegistryInterface'
import { CommandInterface } from '@/Shared/Application/Command/CommandInterface'
import { TransactionalExecutorInterface } from '@/Shared/Application/TransactionalExecutorInterface'
import { CommandBus } from '@/Shared/Infrastructure/CommandBus'

class TestCommand implements CommandInterface {
  constructor(public readonly value: string) {}
}

describe('CommandBus', () => {
  let commandBus: CommandBusInterface
  let mockRegistry: CommandHandlerRegistryInterface
  let mockTransactionalExecutor: TransactionalExecutorInterface
  let mockHandler: CommandHandlerInterface<string>

  beforeEach(() => {
    mockHandler = {
      handle: jest.fn().mockResolvedValue('result'),
    }

    mockRegistry = {
      register: jest.fn(),
      getHandler: jest.fn().mockReturnValue(mockHandler),
    }

    mockTransactionalExecutor = {
      execute: jest
        .fn()
        .mockImplementation(
          async <Result>(callback: () => Promise<Result>): Promise<Result> => {
            return await callback()
          },
        ),
    }

    commandBus = new CommandBus(mockRegistry, mockTransactionalExecutor)
  })

  it('should dispatch command through handler registry', async () => {
    const command = new TestCommand('test')

    await commandBus.dispatch(command)

    expect(mockRegistry.getHandler).toHaveBeenCalledWith(command)
  })

  it('should wrap handler execution in transaction', async () => {
    const command = new TestCommand('test')

    await commandBus.dispatch(command)

    expect(mockTransactionalExecutor.execute).toHaveBeenCalled()
  })

  it('should return handler result', async () => {
    const command = new TestCommand('test')

    const result = await commandBus.dispatch<string>(command)

    expect(result).toBe('result')
  })

  it('should call handler with command', async () => {
    const command = new TestCommand('test')

    await commandBus.dispatch(command)

    expect(mockHandler.handle).toHaveBeenCalledWith(command)
  })

  it('should propagate handler errors', async () => {
    const command = new TestCommand('test')
    const error = new Error('handler error')
    mockHandler.handle = jest.fn().mockRejectedValue(error)

    await expect(commandBus.dispatch(command)).rejects.toThrow('handler error')
  })

  it('should propagate registry errors', async () => {
    const command = new TestCommand('test')
    const error = new Error('handler not found')
    mockRegistry.getHandler = jest.fn().mockImplementation(() => {
      throw error
    })

    await expect(commandBus.dispatch(command)).rejects.toThrow(
      'handler not found',
    )
  })
})
