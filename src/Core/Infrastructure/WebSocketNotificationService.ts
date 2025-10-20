import { NotificationMessageInterface } from '@/Core/Application/NotificationMessageInterface'
import { NotificationServiceInterface } from '@/Core/Application/NotificationServiceInterface'
import { WebSocketServerInterface } from '@/Core/Application/WebSocketServerInterface'
import { UserId } from '@/Core/Domain/UserId'

export class WebSocketNotificationService
  implements NotificationServiceInterface
{
  constructor(private readonly webSocketServer: WebSocketServerInterface) {}

  notifyUser(userId: UserId, message: NotificationMessageInterface): void {
    const serializedMessage = JSON.stringify(message)
    this.webSocketServer.broadcastToUser(userId, serializedMessage)
  }
}
