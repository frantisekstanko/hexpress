import { inject, injectable } from 'inversify'
import { NotificationMessageInterface } from '@/Core/Application/NotificationMessageInterface'
import { NotificationServiceInterface } from '@/Core/Application/NotificationServiceInterface'
import { Services } from '@/Core/Application/Services'
import { WebSocketServerInterface } from '@/Core/Application/WebSocketServerInterface'
import { UserId } from '@/Core/Domain/UserId'

@injectable()
export class WebSocketNotificationService
  implements NotificationServiceInterface
{
  constructor(
    @inject(Services.WebSocketServerInterface)
    private readonly webSocketServer: WebSocketServerInterface,
  ) {}

  notifyUser(userId: UserId, message: NotificationMessageInterface): void {
    const serializedMessage = JSON.stringify(message)
    this.webSocketServer.broadcastToUser(userId, serializedMessage)
  }
}
