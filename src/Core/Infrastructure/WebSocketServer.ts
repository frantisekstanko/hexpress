import { IncomingMessage } from 'node:http'
import { inject, injectable } from 'inversify'
import WebSocket from 'ws'
import { AuthenticatedUser } from '@/Authentication/Application/AuthenticatedUser'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { Symbols as CoreSymbols } from '@/Core/Application/Symbols'
import { AuthenticationHandlerInterface } from '@/Core/Application/WebSocket/AuthenticationHandlerInterface'
import { BroadcasterInterface } from '@/Core/Application/WebSocket/BroadcasterInterface'
import { ConnectionValidatorInterface } from '@/Core/Application/WebSocket/ConnectionValidatorInterface'
import { HeartbeatManagerInterface } from '@/Core/Application/WebSocket/HeartbeatManagerInterface'
import { WebSocketMessageParserInterface } from '@/Core/Application/WebSocket/WebSocketMessageParserInterface'
import { WebSocketServerInterface } from '@/Core/Application/WebSocketServerInterface'
import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { UserId } from '@/Core/Domain/UserId'
import { Broadcaster } from '@/Core/Infrastructure/WebSocket/Broadcaster'

@injectable()
export class WebSocketServer implements WebSocketServerInterface {
  private wss: WebSocket.WebSocketServer | null = null
  private websocketIsClosing = false
  private readonly authenticationTimeout: number

  constructor(
    @inject(CoreSymbols.LoggerInterface)
    private readonly logger: LoggerInterface,
    @inject(CoreSymbols.ConfigInterface)
    private readonly config: ConfigInterface,
    @inject(CoreSymbols.WebSocketMessageParserInterface)
    private readonly messageParser: WebSocketMessageParserInterface,
    @inject(CoreSymbols.ConnectionValidatorInterface)
    private readonly connectionValidator: ConnectionValidatorInterface,
    @inject(CoreSymbols.AuthenticationHandlerInterface)
    private readonly authenticationHandler: AuthenticationHandlerInterface,
    @inject(CoreSymbols.HeartbeatManagerInterface)
    private readonly heartbeatManager: HeartbeatManagerInterface,
    @inject(CoreSymbols.BroadcasterInterface)
    private readonly broadcaster: BroadcasterInterface & Broadcaster,
  ) {
    const authenticationTimeout = Number(
      this.config.get(ConfigOption.WEBSOCKET_AUTH_TIMEOUT_MS),
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

    this.authenticationTimeout = authenticationTimeout
  }

  public initialize(): void {
    const wsPort = this.config.get(ConfigOption.WEBSOCKET_PORT)
    this.wss = new WebSocket.WebSocketServer({ port: Number(wsPort) })

    this.logger.info(`WebSocket server started on port ${wsPort}`)

    this.wss.on(
      'connection',
      (websocket: WebSocket, request: IncomingMessage) => {
        if (this.websocketIsClosing) {
          this.logger.info('Refusing connection because server is closing')
          websocket.close()
          return
        }

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
          this.logger.info(
            'Authentication timeout reached. Closing connection.',
          )
          websocket.close()
        }, this.authenticationTimeout)

        const pingInterval = this.heartbeatManager.startHeartbeat(() => {
          if (websocket.readyState === WebSocket.OPEN) {
            websocket.ping()
          }
        })

        websocket.on('message', (message: WebSocket.RawData) => {
          let data: object

          try {
            data = this.messageParser.parseMessage(message)
          } catch {
            this.logger.info('Received invalid JSON message')
            return
          }

          try {
            const authenticatedUser =
              this.authenticationHandler.authenticateFromMessage(data)

            this.broadcaster.addAuthenticatedClient(
              websocket,
              authenticatedUser,
            )

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
        })

        websocket.on('close', () => {
          this.logger.info('WebSocket connection closed')
          clearTimeout(authTimeout)
          clearInterval(pingInterval)
          this.broadcaster.removeClient(websocket)
        })
      },
    )
  }

  public async shutdown(): Promise<void> {
    if (this.websocketIsClosing) return
    this.websocketIsClosing = true
    this.logger.info('Shutting down WebSocket server...')
    this.logger.info('Disconnecting all clients...')
    this.broadcaster.disconnectAll()
    await new Promise<void>((resolve) => {
      if (!this.wss) {
        resolve()
        return
      }
      this.wss.close(() => {
        resolve()
      })
    })
  }

  public broadcastToUser(userId: UserId, message: string): void {
    if (!this.wss) return
    this.broadcaster.broadcastToUser(userId, message)
  }

  public getClients(): Map<WebSocket, AuthenticatedUser> {
    const clientMap = new Map<WebSocket, AuthenticatedUser>()
    const authenticatedClients = this.broadcaster.getAuthenticatedClients()

    authenticatedClients.forEach((user, client) => {
      clientMap.set(client as unknown as WebSocket, user)
    })

    return clientMap
  }
}
