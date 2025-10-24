import { AuthenticatedUser } from '@/Authentication/Application/AuthenticatedUser'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { ClientConnectionInterface } from '@/Core/Application/WebSocket/ClientConnectionInterface'
import { MessageRouterInterface } from '@/Core/Application/WebSocket/MessageRouterInterface'

export class MessageRouter implements MessageRouterInterface {
  constructor(private readonly logger: LoggerInterface) {}

  routeMessage(
    message: object,
    client: ClientConnectionInterface,
    user: AuthenticatedUser,
  ): void {
    void client
    void user

    if (!('type' in message) || typeof message.type !== 'string') {
      this.logger.info('Message missing type field')
      return
    }

    this.logger.info(`Received message of type: ${message.type}`)
  }
}
