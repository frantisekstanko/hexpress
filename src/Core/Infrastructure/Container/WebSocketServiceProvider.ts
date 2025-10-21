import { TokenService } from '@/Authentication/Application/TokenService'
import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { Services } from '@/Core/Application/Services'
import { AuthenticationHandler } from '@/Core/Infrastructure/WebSocket/AuthenticationHandler'
import { Broadcaster } from '@/Core/Infrastructure/WebSocket/Broadcaster'
import { ConnectionValidator } from '@/Core/Infrastructure/WebSocket/ConnectionValidator'
import { HeartbeatManager } from '@/Core/Infrastructure/WebSocket/HeartbeatManager'
import { WebSocketMessageParser } from '@/Core/Infrastructure/WebSocket/WebSocketMessageParser'
import { WebSocketNotificationService } from '@/Core/Infrastructure/WebSocketNotificationService'
import { WebSocketServer } from '@/Core/Infrastructure/WebSocketServer'

export class WebSocketServiceProvider {
  register(container: ContainerInterface): void {
    container.register(
      Services.ConnectionValidatorInterface,
      (container) =>
        new ConnectionValidator(
          container.get(Services.LoggerInterface),
          container.get(Services.ConfigInterface),
        ),
    )

    container.register(
      Services.AuthenticationHandlerInterface,
      (container) => new AuthenticationHandler(container.get(TokenService)),
    )

    container.register(
      Services.HeartbeatManagerInterface,
      (container) =>
        new HeartbeatManager(container.get(Services.ConfigInterface)),
    )

    container.register(Services.BroadcasterInterface, () => new Broadcaster())

    container.register(
      Services.WebSocketMessageParserInterface,
      () => new WebSocketMessageParser(),
    )

    container.register(
      Services.WebSocketServerInterface,
      (container) =>
        new WebSocketServer(
          container.get(Services.LoggerInterface),
          container.get(Services.ConfigInterface),
          container.get(Services.WebSocketMessageParserInterface),
          container.get(Services.ConnectionValidatorInterface),
          container.get(Services.AuthenticationHandlerInterface),
          container.get(Services.HeartbeatManagerInterface),
          container.get(Services.BroadcasterInterface),
        ),
    )

    container.register(
      Services.NotificationServiceInterface,
      (container) =>
        new WebSocketNotificationService(
          container.get(Services.WebSocketServerInterface),
        ),
    )
  }
}
