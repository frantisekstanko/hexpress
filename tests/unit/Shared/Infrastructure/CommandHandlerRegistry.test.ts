import { CommandHandlerInterface } from '@/Shared/Application/Command/CommandHandlerInterface'
import { CommandInterface } from '@/Shared/Application/Command/CommandInterface'
import { CommandHandlerRegistry } from '@/Shared/Infrastructure/CommandHandlerRegistry'

class TestCommand implements CommandInterface {
  constructor(public readonly value: string) {}
}

class AnotherCommand implements CommandInterface {
  constructor(public readonly number: number) {}
}

describe('CommandHandlerRegistry', () => {
  let registry: CommandHandlerRegistry
  let mockHandler: CommandHandlerInterface<TestCommand, string>
  let anotherMockHandler: CommandHandlerInterface<AnotherCommand, number>

  beforeEach(() => {
    registry = new CommandHandlerRegistry()
    mockHandler = {
      handle: jest.fn().mockResolvedValue('result'),
    }
    anotherMockHandler = {
      handle: jest.fn().mockResolvedValue(42),
    }
  })

  it('should register and retrieve a handler', () => {
    registry.register(TestCommand, mockHandler)

    const command = new TestCommand('test')
    const handler = registry.getHandler(command)

    expect(handler).toBe(mockHandler)
  })

  it('should register multiple handlers', () => {
    registry.register(TestCommand, mockHandler)
    registry.register(AnotherCommand, anotherMockHandler)

    const testCommand = new TestCommand('test')
    const anotherCommand = new AnotherCommand(123)

    expect(registry.getHandler(testCommand)).toBe(mockHandler)
    expect(registry.getHandler(anotherCommand)).toBe(anotherMockHandler)
  })

  it('should throw error when handler not found', () => {
    const command = new TestCommand('test')

    expect(() => registry.getHandler(command)).toThrow(
      'No handler registered for command: TestCommand',
    )
  })

  it('should overwrite handler if registered twice', () => {
    const newMockHandler: CommandHandlerInterface<TestCommand, string> = {
      handle: jest.fn().mockResolvedValue('new result'),
    }

    registry.register(TestCommand, mockHandler)
    registry.register(TestCommand, newMockHandler)

    const command = new TestCommand('test')
    const handler = registry.getHandler(command)

    expect(handler).toBe(newMockHandler)
    expect(handler).not.toBe(mockHandler)
  })
})
