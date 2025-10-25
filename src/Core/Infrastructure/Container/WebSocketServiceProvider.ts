import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { Services } from '@/Core/Application/Services'
import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { Broadcaster } from '@/Core/Infrastructure/WebSocket/Broadcaster'
import { ConnectionManager } from '@/Core/Infrastructure/WebSocket/ConnectionManager'
import { ConnectionValidator } from '@/Core/Infrastructure/WebSocket/ConnectionValidator'
import { HeartbeatManager } from '@/Core/Infrastructure/WebSocket/HeartbeatManager'
import { MessageRouter } from '@/Core/Infrastructure/WebSocket/MessageRouter'
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
      Services.MessageRouterInterface,
      (container) => new MessageRouter(container.get(Services.LoggerInterface)),
    )

    container.register(Services.ConnectionManagerInterface, (container) => {
      const config = container.get(Services.ConfigInterface)
      const authenticationTimeout = Number(
        config.get(ConfigOption.WEBSOCKET_AUTH_TIMEOUT_MS),
      )

      Assertion.number(
        authenticationTimeout,
        'WebSocket authentication timeout must be a number',
      )
      Assertion.greaterThan(
        authenticationTimeout,
        0,
        'WebSocket authentication timeout must be greater than 0',
      )

      return new ConnectionManager(
        container.get(Services.LoggerInterface),
        container.get(Services.ConnectionValidatorInterface),
        container.get(Services.AuthenticationHandlerInterface),
        container.get(Services.HeartbeatManagerInterface),
        container.get(Services.BroadcasterInterface),
        container.get(Services.WebSocketMessageParserInterface),
        container.get(Services.MessageRouterInterface),
        authenticationTimeout,
      )
    })

    container.register(
      Services.WebSocketServerInterface,
      (container) =>
        new WebSocketServer(
          container.get(Services.LoggerInterface),
          container.get(Services.ConfigInterface),
          container.get(Services.BroadcasterInterface),
          container.get(Services.ConnectionManagerInterface),
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
