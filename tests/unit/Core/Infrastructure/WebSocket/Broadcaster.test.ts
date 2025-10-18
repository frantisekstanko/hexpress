import WebSocket from 'ws'
import { AuthenticatedUser } from '@/Authentication/Application/AuthenticatedUser'
import { UserId } from '@/Core/Domain/UserId'
import { Broadcaster } from '@/Core/Infrastructure/WebSocket/Broadcaster'

const USER_ID_1 = '93906a9e-250e-4151-b2e7-4f0ffcb3e11f'
const USER_ID_2 = 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d'

describe('Broadcaster', () => {
  let broadcaster: Broadcaster
  let mockWebSocket1: jest.Mocked<WebSocket>
  let mockWebSocket2: jest.Mocked<WebSocket>

  beforeEach(() => {
    broadcaster = new Broadcaster()

    mockWebSocket1 = {
      send: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<WebSocket>
    Object.defineProperty(mockWebSocket1, 'readyState', {
      value: WebSocket.OPEN,
      writable: true,
    })

    mockWebSocket2 = {
      send: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<WebSocket>
    Object.defineProperty(mockWebSocket2, 'readyState', {
      value: WebSocket.OPEN,
      writable: true,
    })
  })

  describe('addAuthenticatedClient', () => {
    it('should add authenticated client', () => {
      const user = new AuthenticatedUser(UserId.fromString(USER_ID_1))

      broadcaster.addAuthenticatedClient(mockWebSocket1, user)

      expect(broadcaster.getClientCount()).toBe(1)
    })

    it('should add multiple authenticated clients', () => {
      const user1 = new AuthenticatedUser(UserId.fromString(USER_ID_1))
      const user2 = new AuthenticatedUser(UserId.fromString(USER_ID_2))

      broadcaster.addAuthenticatedClient(mockWebSocket1, user1)
      broadcaster.addAuthenticatedClient(mockWebSocket2, user2)

      expect(broadcaster.getClientCount()).toBe(2)
    })
  })

  describe('removeClient', () => {
    it('should remove client', () => {
      const user = new AuthenticatedUser(UserId.fromString(USER_ID_1))
      broadcaster.addAuthenticatedClient(mockWebSocket1, user)

      broadcaster.removeClient(mockWebSocket1)

      expect(broadcaster.getClientCount()).toBe(0)
    })
  })

  describe('broadcastToUser', () => {
    it('should broadcast message only to specific user', () => {
      const user1 = new AuthenticatedUser(UserId.fromString(USER_ID_1))
      const user2 = new AuthenticatedUser(UserId.fromString(USER_ID_2))
      broadcaster.addAuthenticatedClient(mockWebSocket1, user1)
      broadcaster.addAuthenticatedClient(mockWebSocket2, user2)

      broadcaster.broadcastToUser(UserId.fromString(USER_ID_1), 'user1 message')

      expect(mockWebSocket1.send).toHaveBeenCalledWith('user1 message')
      expect(mockWebSocket2.send).not.toHaveBeenCalled()
    })

    it('should broadcast to multiple connections for same user', () => {
      const user = new AuthenticatedUser(UserId.fromString(USER_ID_1))
      broadcaster.addAuthenticatedClient(mockWebSocket1, user)
      broadcaster.addAuthenticatedClient(mockWebSocket2, user)

      broadcaster.broadcastToUser(UserId.fromString(USER_ID_1), 'test message')

      expect(mockWebSocket1.send).toHaveBeenCalledWith('test message')
      expect(mockWebSocket2.send).toHaveBeenCalledWith('test message')
    })
  })

  describe('disconnectAll', () => {
    it('should close all client connections', () => {
      const user1 = new AuthenticatedUser(UserId.fromString(USER_ID_1))
      const user2 = new AuthenticatedUser(UserId.fromString(USER_ID_2))
      broadcaster.addAuthenticatedClient(mockWebSocket1, user1)
      broadcaster.addAuthenticatedClient(mockWebSocket2, user2)

      broadcaster.disconnectAll()

      expect(mockWebSocket1.close).toHaveBeenCalled()
      expect(mockWebSocket2.close).toHaveBeenCalled()
      expect(broadcaster.getClientCount()).toBe(0)
    })
  })

  describe('getAuthenticatedClients', () => {
    it('should return map of authenticated clients', () => {
      const user = new AuthenticatedUser(UserId.fromString(USER_ID_1))
      broadcaster.addAuthenticatedClient(mockWebSocket1, user)

      const clients = broadcaster.getAuthenticatedClients()

      expect(clients.size).toBe(1)
    })
  })
})
