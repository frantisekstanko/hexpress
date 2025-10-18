import { WebSocketServerInterface } from '@/Core/Application/WebSocketServerInterface'

export class MockWebSocketServer implements WebSocketServerInterface {
  broadcast = jest.fn()
  broadcastToUser = jest.fn()
  initialize = jest.fn()
  shutdown = jest.fn()
}
