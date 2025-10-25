import { IncomingMessage } from 'node:http'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { AuthenticationHandlerInterface } from '@/Core/Application/WebSocket/AuthenticationHandlerInterface'
import { BroadcasterInterface } from '@/Core/Application/WebSocket/BroadcasterInterface'
import { ClientConnectionInterface } from '@/Core/Application/WebSocket/ClientConnectionInterface'
import { ConnectionManagerInterface } from '@/Core/Application/WebSocket/ConnectionManagerInterface'
import { ConnectionState } from '@/Core/Application/WebSocket/ConnectionState'
import { ConnectionValidatorInterface } from '@/Core/Application/WebSocket/ConnectionValidatorInterface'
import { HeartbeatManagerInterface } from '@/Core/Application/WebSocket/HeartbeatManagerInterface'
import { MessageRouterInterface } from '@/Core/Application/WebSocket/MessageRouterInterface'
import { WebSocketMessageParserInterface } from '@/Core/Application/WebSocket/WebSocketMessageParserInterface'
import { AuthenticatedUser } from '@/Core/Domain/AuthenticatedUser'

export class ConnectionManager implements ConnectionManagerInterface {
  constructor(
    private readonly logger: LoggerInterface,
    private readonly connectionValidator: ConnectionValidatorInterface,
    private readonly authenticationHandler: AuthenticationHandlerInterface,
    private readonly heartbeatManager: HeartbeatManagerInterface,
    private readonly broadcaster: BroadcasterInterface,
    private readonly messageParser: WebSocketMessageParserInterface,
    private readonly messageRouter: MessageRouterInterface,
    private readonly authenticationTimeout: number,
  ) {}

  handleConnection(
    websocket: ClientConnectionInterface,
    request: IncomingMessage,
  ): void {
    if (!request.headers.origin) {
      this.logger.info('Connection refused due to missing origin header')
      websocket.close()
      return
    }

    if (!this.connectionValidator.isOriginValid(request.headers.origin)) {
      websocket.close()
      return
    }

    const authTimeout = setTimeout(() => {
      this.logger.info('Authentication timeout reached. Closing connection.')
      websocket.close()
    }, this.authenticationTimeout)

    const pingInterval = this.heartbeatManager.startHeartbeat(() => {
      if (websocket.readyState === ConnectionState.OPEN) {
        websocket.ping()
      }
    })

    let authenticatedUser: AuthenticatedUser | null = null

    websocket.on('message', (message) => {
      let data: object

      try {
        data = this.messageParser.parseMessage(message)
      } catch {
        this.logger.info('Received invalid JSON message')
        return
      }

      if (authenticatedUser === null) {
        try {
          authenticatedUser =
            this.authenticationHandler.authenticateFromMessage(data)

          this.broadcaster.addAuthenticatedClient(websocket, authenticatedUser)

          this.logger.info(
            `New client authenticated. Number of authenticated clients: ${this.broadcaster.getClientCount().toString()}`,
          )

          clearTimeout(authTimeout)

          return
        } catch {
          this.logger.info('Authentication failed. Closing connection.')
          websocket.send('auth_failed')
          websocket.close()
          return
        }
      }

      this.messageRouter.routeMessage(data, websocket, authenticatedUser)
    })

    websocket.on('close', () => {
      this.logger.info('WebSocket connection closed')
      clearTimeout(authTimeout)
      clearInterval(pingInterval)
      this.broadcaster.removeClient(websocket)
    })
  }
}
