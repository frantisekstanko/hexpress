import WebSocket from 'ws'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { AuthenticatedUser } from '@/Core/Domain/AuthenticatedUser'
import { UserId } from '@/Core/Domain/UserId'
import { MessageRouter } from '@/Core/Infrastructure/WebSocket/MessageRouter'

const USER_ID = 'ac70bec3-d51b-432c-9a95-484a3505de6e'

describe('MessageRouter', () => {
  let messageRouter: MessageRouter
  let mockLogger: jest.Mocked<LoggerInterface>
  let mockWebSocket: jest.Mocked<WebSocket>
  let user: AuthenticatedUser

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<LoggerInterface>

    mockWebSocket = {} as jest.Mocked<WebSocket>

    user = new AuthenticatedUser(UserId.fromString(USER_ID))

    messageRouter = new MessageRouter(mockLogger)
  })

  describe('routeMessage', () => {
    it('should log message type when type field is present', () => {
      const message = { type: 'ping' }

      messageRouter.routeMessage(message, mockWebSocket, user)

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Received message of type: ping',
      )
    })

    it('should log info when type field is missing', () => {
      const message = { data: 'something' }

      messageRouter.routeMessage(message, mockWebSocket, user)

      expect(mockLogger.info).toHaveBeenCalledWith('Message missing type field')
    })

    it('should log info when type is not a string', () => {
      const message = { type: 123 }

      messageRouter.routeMessage(message, mockWebSocket, user)

      expect(mockLogger.info).toHaveBeenCalledWith('Message missing type field')
    })

    it('should handle different message types', () => {
      const messages = [
        { type: 'subscribe' },
        { type: 'unsubscribe' },
        { type: 'ping' },
      ]

      messages.forEach((message) => {
        messageRouter.routeMessage(message, mockWebSocket, user)
      })

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Received message of type: subscribe',
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Received message of type: unsubscribe',
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Received message of type: ping',
      )
    })
  })
})
