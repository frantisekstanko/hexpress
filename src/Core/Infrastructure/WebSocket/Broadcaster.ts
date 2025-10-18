import { injectable } from 'inversify'
import WebSocket from 'ws'
import { AuthenticatedUser } from '@/Authentication/Application/AuthenticatedUser'
import { BroadcasterInterface } from '@/Core/Application/WebSocket/BroadcasterInterface'
import { ClientConnectionInterface } from '@/Core/Application/WebSocket/ClientConnectionInterface'
import { UserId } from '@/Core/Domain/UserId'

@injectable()
export class Broadcaster implements BroadcasterInterface {
  private authenticatedClients = new Map<WebSocket, AuthenticatedUser>()

  broadcastToUser(userId: UserId, message: string): void {
    this.authenticatedClients.forEach((user, websocket) => {
      if (
        user.getUserId().equals(userId) &&
        websocket.readyState === WebSocket.OPEN
      ) {
        websocket.send(message)
      }
    })
  }

  getAuthenticatedClients(): Map<ClientConnectionInterface, AuthenticatedUser> {
    const clientConnectionMap = new Map<
      ClientConnectionInterface,
      AuthenticatedUser
    >()

    this.authenticatedClients.forEach((user, websocket) => {
      clientConnectionMap.set(websocket, user)
    })

    return clientConnectionMap
  }

  addAuthenticatedClient(websocket: WebSocket, user: AuthenticatedUser): void {
    this.authenticatedClients.set(websocket, user)
  }

  removeClient(websocket: WebSocket): void {
    this.authenticatedClients.delete(websocket)
  }

  disconnectAll(): void {
    this.authenticatedClients.forEach((user, websocket) => {
      websocket.close()
    })
    this.authenticatedClients.clear()
  }

  getClientCount(): number {
    return this.authenticatedClients.size
  }
}
