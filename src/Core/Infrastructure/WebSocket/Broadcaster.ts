import { BroadcasterInterface } from '@/Core/Application/WebSocket/BroadcasterInterface'
import { ClientConnectionInterface } from '@/Core/Application/WebSocket/ClientConnectionInterface'
import { ConnectionState } from '@/Core/Application/WebSocket/ConnectionState'
import { AuthenticatedUser } from '@/Core/Domain/AuthenticatedUser'
import { UserId } from '@/Core/Domain/UserId'

export class Broadcaster implements BroadcasterInterface {
  private authenticatedClients = new Map<
    ClientConnectionInterface,
    AuthenticatedUser
  >()

  broadcastToUser(userId: UserId, message: string): void {
    this.authenticatedClients.forEach((user, client) => {
      if (
        user.getUserId().equals(userId) &&
        client.readyState === ConnectionState.OPEN
      ) {
        client.send(message)
      }
    })
  }

  getAuthenticatedClients(): Map<ClientConnectionInterface, AuthenticatedUser> {
    const clientConnectionMap = new Map<
      ClientConnectionInterface,
      AuthenticatedUser
    >()

    this.authenticatedClients.forEach((user, client) => {
      clientConnectionMap.set(client, user)
    })

    return clientConnectionMap
  }

  addAuthenticatedClient(
    client: ClientConnectionInterface,
    user: AuthenticatedUser,
  ): void {
    this.authenticatedClients.set(client, user)
  }

  removeClient(client: ClientConnectionInterface): void {
    this.authenticatedClients.delete(client)
  }

  disconnectAll(): void {
    this.authenticatedClients.forEach((user, client) => {
      client.close()
    })
    this.authenticatedClients.clear()
  }

  getClientCount(): number {
    return this.authenticatedClients.size
  }
}
