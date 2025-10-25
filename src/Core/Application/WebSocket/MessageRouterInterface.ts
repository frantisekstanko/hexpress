import { ClientConnectionInterface } from '@/Core/Application/WebSocket/ClientConnectionInterface'
import { AuthenticatedUser } from '@/Core/Domain/AuthenticatedUser'

export interface MessageRouterInterface {
  routeMessage(
    message: object,
    client: ClientConnectionInterface,
    user: AuthenticatedUser,
  ): void
}
