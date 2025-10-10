import { WebSocketServerInterface } from '@/Shared/Application/WebSocketServerInterface'

export class MockWebSocketServer implements WebSocketServerInterface {
  broadcast = jest.fn()
  initialize = jest.fn()
  shutdown = jest.fn()
}
