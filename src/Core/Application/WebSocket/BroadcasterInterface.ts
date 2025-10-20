import { AuthenticatedUser } from '@/Authentication/Application/AuthenticatedUser'
import { ClientConnectionInterface } from '@/Core/Application/WebSocket/ClientConnectionInterface'
import { UserId } from '@/Core/Domain/UserId'

export interface BroadcasterInterface {
  broadcastToUser(userId: UserId, message: string): void
  getAuthenticatedClients(): Map<ClientConnectionInterface, AuthenticatedUser>
  addAuthenticatedClient(
    client: ClientConnectionInterface,
    user: AuthenticatedUser,
  ): void
  removeClient(client: ClientConnectionInterface): void
  disconnectAll(): void
  getClientCount(): number
}
