import { IncomingMessage } from 'node:http'
import WebSocket from 'ws'
import { AuthenticatedUser } from '@/Authentication/Application/AuthenticatedUser'
import { InvalidTokenException } from '@/Authentication/Domain/InvalidTokenException'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { AuthenticationHandlerInterface } from '@/Core/Application/WebSocket/AuthenticationHandlerInterface'
import { BroadcasterInterface } from '@/Core/Application/WebSocket/BroadcasterInterface'
import { ConnectionValidatorInterface } from '@/Core/Application/WebSocket/ConnectionValidatorInterface'
import { HeartbeatManagerInterface } from '@/Core/Application/WebSocket/HeartbeatManagerInterface'
import { MessageRouterInterface } from '@/Core/Application/WebSocket/MessageRouterInterface'
import { WebSocketMessageParserInterface } from '@/Core/Application/WebSocket/WebSocketMessageParserInterface'
import { UserId } from '@/Core/Domain/UserId'
import { ConnectionManager } from '@/Core/Infrastructure/WebSocket/ConnectionManager'

const USER_ID = '8b83f6f4-09d9-4bfc-a66d-998ae55b3b2e'
const AUTH_TIMEOUT = 5000

describe('ConnectionManager', () => {
  let connectionManager: ConnectionManager
  let mockLogger: jest.Mocked<LoggerInterface>
  let mockConnectionValidator: jest.Mocked<ConnectionValidatorInterface>
  let mockAuthenticationHandler: jest.Mocked<AuthenticationHandlerInterface>
  let mockHeartbeatManager: jest.Mocked<HeartbeatManagerInterface>
  let mockBroadcaster: jest.Mocked<BroadcasterInterface>
  let mockMessageParser: jest.Mocked<WebSocketMessageParserInterface>
  let mockMessageRouter: jest.Mocked<MessageRouterInterface>
  let mockWebSocket: jest.Mocked<WebSocket>
  let mockRequest: IncomingMessage

  beforeEach(() => {
    jest.useFakeTimers()

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<LoggerInterface>

    mockConnectionValidator = {
      isOriginValid: jest.fn(),
    } as jest.Mocked<ConnectionValidatorInterface>

    mockAuthenticationHandler = {
      authenticateFromMessage: jest.fn(),
    } as jest.Mocked<AuthenticationHandlerInterface>

    mockHeartbeatManager = {
      startHeartbeat: jest.fn().mockReturnValue(123),
    } as jest.Mocked<HeartbeatManagerInterface>

    mockBroadcaster = {
      addAuthenticatedClient: jest.fn(),
      removeClient: jest.fn(),
      getClientCount: jest.fn().mockReturnValue(1),
      broadcastToUser: jest.fn(),
      getAuthenticatedClients: jest.fn(),
      disconnectAll: jest.fn(),
    } as jest.Mocked<BroadcasterInterface>

    mockMessageParser = {
      parseMessage: jest.fn(),
    } as jest.Mocked<WebSocketMessageParserInterface>

    mockMessageRouter = {
      routeMessage: jest.fn(),
    } as jest.Mocked<MessageRouterInterface>

    mockWebSocket = {
      close: jest.fn(),
      send: jest.fn(),
      on: jest.fn(),
      ping: jest.fn(),
    } as unknown as jest.Mocked<WebSocket>
    Object.defineProperty(mockWebSocket, 'readyState', {
      value: WebSocket.OPEN,
      writable: true,
    })

    mockRequest = {
      headers: {
        origin: 'http://localhost:3000',
      },
    } as IncomingMessage

    connectionManager = new ConnectionManager(
      mockLogger,
      mockConnectionValidator,
      mockAuthenticationHandler,
      mockHeartbeatManager,
      mockBroadcaster,
      mockMessageParser,
      mockMessageRouter,
      AUTH_TIMEOUT,
    )
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('handleConnection', () => {
    it('should refuse connection when origin header is missing', () => {
      mockRequest.headers.origin = undefined

      connectionManager.handleConnection(mockWebSocket, mockRequest)

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Connection refused due to missing origin header',
      )
      expect(mockWebSocket.close).toHaveBeenCalled()
    })

    it('should refuse connection when origin is invalid', () => {
      mockConnectionValidator.isOriginValid.mockReturnValue(false)

      connectionManager.handleConnection(mockWebSocket, mockRequest)

      expect(mockConnectionValidator.isOriginValid).toHaveBeenCalledWith(
        'http://localhost:3000',
      )
      expect(mockWebSocket.close).toHaveBeenCalled()
    })

    it('should set up authentication timeout', () => {
      mockConnectionValidator.isOriginValid.mockReturnValue(true)

      connectionManager.handleConnection(mockWebSocket, mockRequest)

      jest.advanceTimersByTime(AUTH_TIMEOUT)

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Authentication timeout reached. Closing connection.',
      )
      expect(mockWebSocket.close).toHaveBeenCalled()
    })

    it('should start heartbeat', () => {
      mockConnectionValidator.isOriginValid.mockReturnValue(true)

      connectionManager.handleConnection(mockWebSocket, mockRequest)

      expect(mockHeartbeatManager.startHeartbeat).toHaveBeenCalled()
    })

    it('should authenticate user on first message', () => {
      mockConnectionValidator.isOriginValid.mockReturnValue(true)
      const authMessage = { type: 'auth', token: 'valid-token' }
      const user = new AuthenticatedUser(UserId.fromString(USER_ID))

      mockMessageParser.parseMessage.mockReturnValue(authMessage)
      mockAuthenticationHandler.authenticateFromMessage.mockReturnValue(user)

      connectionManager.handleConnection(mockWebSocket, mockRequest)

      const messageHandler = mockWebSocket.on.mock.calls.find(
        (call) => call[0] === 'message',
      )![1] as (message: Buffer) => void
      messageHandler(Buffer.from('test'))

      expect(
        mockAuthenticationHandler.authenticateFromMessage,
      ).toHaveBeenCalledWith(authMessage)
      expect(mockBroadcaster.addAuthenticatedClient).toHaveBeenCalledWith(
        mockWebSocket,
        user,
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'New client authenticated. Number of authenticated clients: 1',
      )
    })

    it('should close connection when authentication fails', () => {
      mockConnectionValidator.isOriginValid.mockReturnValue(true)
      const authMessage = { type: 'auth', token: 'invalid-token' }

      mockMessageParser.parseMessage.mockReturnValue(authMessage)
      mockAuthenticationHandler.authenticateFromMessage.mockImplementation(
        () => {
          throw new InvalidTokenException('Invalid token')
        },
      )

      connectionManager.handleConnection(mockWebSocket, mockRequest)

      const messageHandler = mockWebSocket.on.mock.calls.find(
        (call) => call[0] === 'message',
      )![1] as (message: Buffer) => void
      messageHandler(Buffer.from('test'))

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Authentication failed. Closing connection.',
      )
      expect(mockWebSocket.send).toHaveBeenCalledWith('auth_failed')
      expect(mockWebSocket.close).toHaveBeenCalled()
    })

    it('should route subsequent messages after authentication', () => {
      mockConnectionValidator.isOriginValid.mockReturnValue(true)
      const authMessage = { type: 'auth', token: 'valid-token' }
      const user = new AuthenticatedUser(UserId.fromString(USER_ID))
      const dataMessage = { type: 'ping' }

      mockMessageParser.parseMessage
        .mockReturnValueOnce(authMessage)
        .mockReturnValueOnce(dataMessage)
      mockAuthenticationHandler.authenticateFromMessage.mockReturnValue(user)

      connectionManager.handleConnection(mockWebSocket, mockRequest)

      const messageHandler = mockWebSocket.on.mock.calls.find(
        (call) => call[0] === 'message',
      )![1] as (message: Buffer) => void

      messageHandler(Buffer.from('auth'))
      messageHandler(Buffer.from('data'))

      expect(mockMessageRouter.routeMessage).toHaveBeenCalledWith(
        dataMessage,
        mockWebSocket,
        user,
      )
    })

    it('should log and ignore invalid JSON messages', () => {
      mockConnectionValidator.isOriginValid.mockReturnValue(true)
      mockMessageParser.parseMessage.mockImplementation(() => {
        throw new Error('Invalid JSON')
      })

      connectionManager.handleConnection(mockWebSocket, mockRequest)

      const messageHandler = mockWebSocket.on.mock.calls.find(
        (call) => call[0] === 'message',
      )![1] as (message: Buffer) => void
      messageHandler(Buffer.from('invalid'))

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Received invalid JSON message',
      )
      expect(mockWebSocket.close).not.toHaveBeenCalled()
    })

    it('should clean up on connection close', () => {
      mockConnectionValidator.isOriginValid.mockReturnValue(true)

      connectionManager.handleConnection(mockWebSocket, mockRequest)

      const closeHandler = mockWebSocket.on.mock.calls.find(
        (call) => call[0] === 'close',
      )![1] as () => void
      closeHandler()

      expect(mockLogger.info).toHaveBeenCalledWith(
        'WebSocket connection closed',
      )
      expect(mockBroadcaster.removeClient).toHaveBeenCalledWith(mockWebSocket)
    })

    it('should clear authentication timeout after successful authentication', () => {
      mockConnectionValidator.isOriginValid.mockReturnValue(true)
      const authMessage = { type: 'auth', token: 'valid-token' }
      const user = new AuthenticatedUser(UserId.fromString(USER_ID))

      mockMessageParser.parseMessage.mockReturnValue(authMessage)
      mockAuthenticationHandler.authenticateFromMessage.mockReturnValue(user)

      connectionManager.handleConnection(mockWebSocket, mockRequest)

      const messageHandler = mockWebSocket.on.mock.calls.find(
        (call) => call[0] === 'message',
      )![1] as (message: Buffer) => void
      messageHandler(Buffer.from('test'))

      jest.advanceTimersByTime(AUTH_TIMEOUT)

      expect(mockWebSocket.close).not.toHaveBeenCalled()
    })

    it('should ping websocket when heartbeat triggers', () => {
      mockConnectionValidator.isOriginValid.mockReturnValue(true)
      let heartbeatCallback: (() => void) | undefined

      mockHeartbeatManager.startHeartbeat.mockImplementation((callback) => {
        heartbeatCallback = callback
        return 123 as unknown as NodeJS.Timeout
      })

      connectionManager.handleConnection(mockWebSocket, mockRequest)

      heartbeatCallback!()

      expect(mockWebSocket.ping).toHaveBeenCalled()
    })
  })
})
