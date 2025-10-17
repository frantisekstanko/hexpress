import { LoggerInterface } from '@/Core/Application/LoggerInterface'

export class MockLogger implements LoggerInterface {
  info = jest.fn()
  warning = jest.fn()
  error = jest.fn()
  debug = jest.fn()
  close = jest.fn()
}
