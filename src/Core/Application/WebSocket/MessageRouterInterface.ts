import { AuthenticatedUser } from '@/Authentication/Application/AuthenticatedUser'
import { ClientConnectionInterface } from '@/Core/Application/WebSocket/ClientConnectionInterface'

export interface MessageRouterInterface {
  routeMessage(
    message: object,
    client: ClientConnectionInterface,
    user: AuthenticatedUser,
  ): void
}
