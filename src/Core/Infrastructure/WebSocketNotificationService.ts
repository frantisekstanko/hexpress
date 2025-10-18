import { inject, injectable } from 'inversify'
import { NotificationServiceInterface } from '@/Core/Application/NotificationServiceInterface'
import { Symbols } from '@/Core/Application/Symbols'
import { WebSocketServerInterface } from '@/Core/Application/WebSocketServerInterface'

@injectable()
export class WebSocketNotificationService
  implements NotificationServiceInterface
{
  constructor(
    @inject(Symbols.WebSocketServerInterface)
    private readonly webSocketServer: WebSocketServerInterface,
  ) {}

  notifyClients(message: string): void {
    this.webSocketServer.broadcast(message)
  }
}
